import numpy as np
import xarray as xr
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import rasterio
from rasterio.transform import from_origin
from rasterio.plot import reshape_as_raster
from rasterio.mask import mask
import geopandas as gpd
import subprocess
import os

def netcdf_to_geotiff_rgb(nc_file, output_tiff, colormap='jet'):
    # Abre el archivo NetCDF
    ds = xr.open_dataset(nc_file)
    
    # Extrae las variables
    lat = ds['lat'].values
    lon = ds['lon'].values
    data = ds['value'].values

    # Crea el colormap 'jet'
    cmap = plt.get_cmap(colormap)
    norm = mcolors.Normalize(vmin=np.nanmin(data), vmax=np.nanmax(data))

    # Aplica el colormap para crear una imagen RGB
    rgba_img = cmap(norm(data))[:, :, :3]  # Ignoramos la transparencia
    
    # Reshape para que sea compatible con rasterio (de (lat, lon, 3) a (3, lat, lon))
    rgb_img = reshape_as_raster(rgba_img)
    
    # Invertir la matriz de datos en el eje Y para corregir la orientación
    rgb_img = np.flip(rgb_img, axis=1)  # Invertir el eje Y
    
    # Define la georreferenciación usando latitudes y longitudes
    transform = from_origin(lon.min(), lat.max(), np.abs(lon[1] - lon[0]), np.abs(lat[1] - lat[0]))
    
    # Escribe la imagen RGB en formato GeoTIFF
    with rasterio.open(
        output_tiff,
        'w',
        driver='GTiff',
        height=rgb_img.shape[1],
        width=rgb_img.shape[2],
        count=3,  # Tres canales RGB
        dtype=rgb_img.dtype,
        crs="EPSG:4326",  # Asume WGS84, ajusta según necesites
        transform=transform
    ) as dst:
        dst.write(rgb_img[0], 1)  # Red channel
        dst.write(rgb_img[1], 2)  # Green channel
        dst.write(rgb_img[2], 3)  # Blue channel

    print(f"GeoTIFF RGB generado correctamente: {output_tiff}")


def aplicar_mascara_transparente(geotiff_path, shapefile_path, output_path):
    # Lee el shapefile de la línea de costa
    gdf = gpd.read_file(shapefile_path)
    
    # Filtra las geometrías no nulas
    geometries = [geom for geom in gdf.geometry if geom is not None]
    
    # Verifica si hay geometrías válidas antes de continuar
    if not geometries:
        print("Error: No se encontraron geometrías válidas en el shapefile.")
        return
    
    # Abre el archivo GeoTIFF RGB generado previamente
    with rasterio.open(geotiff_path) as src:
        # Aplica la máscara sin invertir, para mantener solo las áreas de tierra
        out_image, out_transform = mask(src, geometries, crop=False, invert=False, nodata=0)
        
        # Escribe el nuevo GeoTIFF con transparencia aplicada en el área de mar
        with rasterio.open(
            output_path,
            'w',
            driver='GTiff',
            height=out_image.shape[1],
            width=out_image.shape[2],
            count=3,
            dtype=out_image.dtype,
            crs=src.crs,
            transform=out_transform
        ) as dst:
            for i in range(1, 4):  # Red, Green, Blue channels
                dst.write(out_image[i - 1], i)

    print(f"GeoTIFF con transparencia generado: {output_path}")




def convertir_a_8bits(input_tiff, output_vrt):
    # Comando gdal_translate para convertir a 8 bits
    command = [
        "gdal_translate", "-of", "VRT", "-ot", "Byte", "-scale", input_tiff, output_vrt
    ]
    
    try:
        subprocess.run(command, check=True)
        print(f"Archivo convertido a 8 bits: {output_vrt}")
    except subprocess.CalledProcessError as e:
        print(f"Error al convertir {input_tiff} a 8 bits: {e}")

def create_tiles(input_vrt, zoom_min=3, zoom_max=10):
    # Ejecuta gdal2tiles para crear los tiles de zoom nivel 3 al 8
    output_dir = input_vrt.replace('.vrt', '_tiles')
    command = [
        'gdal2tiles.py',
        '-z', f'{zoom_min}-{zoom_max}',  # Especifica el rango de zoom
        input_vrt,  # Archivo VRT
        output_dir  # Carpeta de salida
    ]
    
    try:
        subprocess.run(command, check=True)
        print(f"Tiles generados para {input_vrt} en niveles de zoom {zoom_min}-{zoom_max}")
    except subprocess.CalledProcessError as e:
        print(f"Error al generar tiles para {input_vrt}: {e}")

# Procesar los tres archivos NetCDF y generar los GeoTIFF
shapefile_path = '/home/adrian/WRF-ok/shp/reproj_prov.shp'

netcdf_to_geotiff_rgb('N_corregido-1.nc', 'N_corregido-1_rgb.tif','jet')
netcdf_to_geotiff_rgb('Ng.nc', 'Ng_rgb.tif','jet')
netcdf_to_geotiff_rgb('TD_corregido.nc', 'TD_corregido_rgb.tif','gist_ncar')

# Aplicar máscara de transparencia usando el shapefile
for geotiff in ['N_corregido-1_rgb.tif', 'Ng_rgb.tif', 'TD_corregido_rgb.tif']:
    clipped_tiff = geotiff.replace('_rgb.tif', '_clipped_rgb.tif')
    aplicar_mascara_transparente(geotiff, shapefile_path, clipped_tiff)
    
    # Convertir el archivo recortado a 8 bits y generar tiles
    vrt_file = clipped_tiff.replace('.tif', '_8bit.vrt')
    convertir_a_8bits(clipped_tiff, vrt_file)
    create_tiles(vrt_file)
