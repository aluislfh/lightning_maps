// src_js/app.js

// Inicializar el mapa en el área de Cuba con un zoom inicial de 5
const map = L.map('map', {
  center: [21.25439875782822, -79.52396797010076], // Coordenadas centradas en Cuba
  zoom: 5,
  minZoom: 5,
  maxZoom: 10,
  zoomControl: false, // Desactivar el control de zoom predeterminado
  maxBounds: [[12, -93], [30, -66]] // Limitar el área visible
});

// Añadir control de zoom en la esquina superior derecha
L.control.zoom({ position: 'topright' }).addTo(map);

// Añadir control de pantalla completa
L.control.fullscreen({
  position: 'topright',
  title: 'Pantalla completa',
  titleCancel: 'Salir de pantalla completa'
}).addTo(map);

// Añadir control de escala en kilómetros en la esquina inferior izquierda
L.control.scale({
  metric: true,
  imperial: false,
  position: 'bottomleft'
}).addTo(map);

// Añadir control de ubicación (Locate) en la esquina superior derecha
L.control.locate({
  position: 'topright',
  flyTo: true,
  icon: 'fa fa-location-arrow',
  strings: {
    title: "Mostrar mi ubicación" // Texto del tooltip
  }
}).addTo(map);

// Capa base desde caché local, activada por defecto
const arcGISLayer = L.tileLayer('./cache/ArcGIS Online Imagery/{z}/{x}/{y}.png', {
  attribution: '&copy; ArcGIS Imagery'
}).addTo(map);

// Capas adicionales
const TD_corregido_tiles = L.tileLayer('./data/TD_corregido_clipped_rgb_8bit_tiles/{z}/{x}/{y}.png', {
  tms: true, opacity: 0.7, maxZoom: 10
});
const Ng_tiles = L.tileLayer('./data/Ng_clipped_rgb_8bit_tiles/{z}/{x}/{y}.png', { 
  tms: true, opacity: 0.7, maxZoom: 10 
});
const N_corregido_tiles = L.tileLayer('./data/N_corregido-1_clipped_rgb_8bit_tiles/{z}/{x}/{y}.png', {
  tms: true, opacity: 0.7, maxZoom: 10 
});

// Control de capas base y capas adicionales
const baseMaps = {
  "ArcGIS Imagery": arcGISLayer
};

const overlayMaps = {
  "TD Corregido": TD_corregido_tiles,
  "Ng Clipped": Ng_tiles,
  "N Corregido-1": N_corregido_tiles
};

// Añadir control de capas en la esquina superior izquierda
const layerControl = L.control.layers(baseMaps, overlayMaps, { position: 'topleft', collapsed: false }).addTo(map);

// Seleccionar el contenedor de las barras de color
const colorBarContainer = document.getElementById('colorbars-container');

// Función para actualizar la barra de color según la capa seleccionada
function updateColorBar(selectedLayer) {
  // Ocultar todas las imágenes primero
  colorBarContainer.innerHTML = '';

  // Mostrar la imagen correspondiente a la capa activa
  let imgSrc = '';
  if (selectedLayer === 'TD Corregido') {
    imgSrc = './images/TD_corregido_colorbar.png';
  } else if (selectedLayer === 'Ng Clipped') {
    imgSrc = './images/Ng_colorbar.png';
  } else if (selectedLayer === 'N Corregido-1') {
    imgSrc = './images/N_corregido-1_colorbar.png';
  }

  if (imgSrc) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = `${selectedLayer} Colorbar`;
    colorBarContainer.appendChild(img);
  }
}

// Event listener para el cambio de capas
map.on('overlayadd', function (event) {
  updateColorBar(event.name);
});

// Event listener para cuando se elimina una capa
map.on('overlayremove', function () {
  colorBarContainer.innerHTML = ''; // Ocultar barra de colores cuando no hay capas activas
});
