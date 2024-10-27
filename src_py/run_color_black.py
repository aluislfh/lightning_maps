import os
from PIL import Image

def convertir_negro_a_transparente(directorio_tiles):
    # Recorre todas las carpetas de niveles de zoom
    for root, _, files in os.walk(directorio_tiles):
        for file in files:
            if file.endswith(".png"):
                # Ruta completa de cada imagen
                ruta_imagen = os.path.join(root, file)
                
                # Abre la imagen
                with Image.open(ruta_imagen) as img:
                    # Asegura que la imagen tenga canal alpha
                    img = img.convert("RGBA")
                    datos = img.getdata()
                    
                    # Reemplaza los píxeles negros por transparencia
                    nuevos_datos = [
                        (255, 255, 255, 0) if (r == 0 and g == 0 and b == 0) else (r, g, b, a)
                        for r, g, b, a in datos
                    ]
                    img.putdata(nuevos_datos)
                    
                    # Guarda la imagen sobrescribiendo la original
                    img.save(ruta_imagen)
                print(f"Procesada y actualizada: {ruta_imagen}")

# Define los directorios de tiles donde están las imágenes PNG
directorios_tiles = [
    "/home/adrian/NWP/Lourdes/daniela/mapas_interactivos/listos/transparente/N_corregido-1_clipped_rgb_8bit_tiles",
    "/home/adrian/NWP/Lourdes/daniela/mapas_interactivos/listos/transparente/Ng_clipped_rgb_8bit_tiles",
    "/home/adrian/NWP/Lourdes/daniela/mapas_interactivos/listos/transparente/TD_corregido_clipped_rgb_8bit_tiles",
]

# Aplica la conversión a cada directorio de tiles
for directorio in directorios_tiles:
    convertir_negro_a_transparente(directorio)
