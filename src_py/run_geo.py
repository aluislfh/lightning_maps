import numpy as np
import xarray as xr
import geopandas as gpd
from rasterio.mask import mask
import json
import rasterio
from rasterio.transform import from_origin
import os

def netcdf_to_json(nc_file, shapefile_path, output_json):
    # Abre el archivo NetCDF
    ds = xr.open_dataset(nc_file)
    
    # Extrae las variables
    lat = ds['lat'].values
    lon = ds['lon'].values
    data = ds['value'].values
    
    # Define la georreferenciación para crear el transform que usaremos con rasterio
    transform = from_origin(lon.min(), lat.max(), np.abs(lon[1] - lon[0]), np.abs(lat[1] - lat[0]))
    
    # Crea un perfil temporal para rasterio
    profile = {
        'driver': 'GTiff',
        'height': data.shape[0],
        'width': data.shape[1],
        'count': 1,
        'dtype': data.dtype,
        'crs': "EPSG:4326",
        'transform': transform
    }
    
    # Guarda los valores de tierra en una lista para el JSON
    data_on_land = []
    
    # Lee el shapefile de la línea de costa
    gdf = gpd.read_file(shapefile_path)
    geometries = [geom for geom in gdf.geometry if geom is not None]
    
    # Ruta temporal para almacenar el raster
    temp_raster_path = '/tmp/temp_raster.tif'
    
    # Creamos un raster temporal con los datos y aplicamos la máscara
    with rasterio.open(temp_raster_path, 'w', **profile) as temp_raster:
        temp_raster.write(data, 1)
    
    # Abre el archivo temporal en modo lectura para aplicar la máscara
    with rasterio.open(temp_raster_path, 'r') as src:
        # Aplicar máscara sin invertir para mantener solo las áreas de tierra
        masked_data, _ = mask(src, geometries, crop=False, invert=False, nodata=np.nan)
    
    # Recorrer la matriz y almacenar solo valores en tierra
    for i in range(masked_data.shape[1]):
        for j in range(masked_data.shape[2]):
            value = masked_data[0, i, j]
            if not np.isnan(value):
                # Almacena solo valores en tierra
                data_on_land.append([lat[i], lon[j], float(value)])  # Compacta a una lista

    # Guardar los datos en formato JSON compacto (sin saltos de línea ni espacios innecesarios)
    with open(output_json, 'w') as f:
        json.dump(data_on_land, f, separators=(',', ':'))
    
    print(f"Archivo JSON generado correctamente: {output_json}")
    
    # Elimina el archivo temporal
    os.remove(temp_raster_path)

# Archivos de entrada y salida
shapefile_path = '/home/adrian/WRF-ok/shp/reproj_prov.shp'

# Procesar los tres archivos NetCDF y generar JSON
netcdf_to_json('N_corregido-1.nc', shapefile_path, 'N_corregido-1.json')
netcdf_to_json('Ng.nc', shapefile_path, 'Ng.json')
netcdf_to_json('TD_corregido.nc', shapefile_path, 'TD_corregido.json')
