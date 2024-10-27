import numpy as np
import xarray as xr
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors

def save_colorbar_only(nc_file, output_png, colormap='jet'):
    # Abre el archivo NetCDF
    ds = xr.open_dataset(nc_file)
    
    # Extrae la variable de datos
    data = ds['value'].values
    
    # Crea el colormap y la normalización
    cmap = plt.get_cmap(colormap)
    norm = mcolors.Normalize(vmin=np.nanmin(data), vmax=np.nanmax(data))

    # Crea una figura solo para la barra de colores
    fig, ax = plt.subplots(figsize=(1.5, 6))  # Ajuste de tamaño de la barra
    fig.subplots_adjust(right=0.5)  # Ajusta la posición para solo mostrar la barra
    
    # Añade la barra de colores
    cbar = fig.colorbar(plt.cm.ScalarMappable(norm=norm, cmap=cmap), cax=ax, orientation='vertical')
    cbar.set_label('Intensidad')  # Etiqueta personalizada

    # Guarda la figura de la barra de colores en un archivo PNG
    plt.savefig(output_png, bbox_inches='tight', pad_inches=0.1)
    plt.close(fig)
    print(f"Barra de colores guardada en: {output_png}")

# Guarda solo la leyenda para cada archivo NetCDF
save_colorbar_only('N_corregido-1.nc', 'N_corregido-1_colorbar.png','jet')
save_colorbar_only('Ng.nc', 'Ng_colorbar.png','jet')
save_colorbar_only('TD_corregido.nc', 'TD_corregido_colorbar.png','gist_ncar')
