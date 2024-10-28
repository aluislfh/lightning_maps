// src_js/app.js

// Inicializar el mapa en el área de Cuba con un zoom inicial de 7
const map = L.map('map', {
  center: [21.25439875782822, -79.52396797010076], // Coordenadas centradas en Cuba
  zoom: 7,
  minZoom: 5,
  maxZoom: 10,
  maxBoundsViscosity: 1.0,
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

// Capa base desde caché local (ArcGIS) activada por defecto
const arcGISLayer = L.tileLayer('./cache/ArcGIS_Online_Imagery/{z}/{x}/{y}.jpg', {
  minZoom: 5, maxZoom: 9, maxNativeZoom: 10,
  center: [21.25439875782822, -79.52396797010076],
  maxBounds: [[12, -93], [30, -66]],
  zIndex: 1,
  attribution: 'ArcGIS Imagery'
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
  colorBarContainer.innerHTML = '';

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

// Control de selección exclusiva de capas
function toggleLayer(layer) {
  map.eachLayer(function (existingLayer) {
    if (existingLayer !== arcGISLayer && existingLayer !== layer) {
      map.removeLayer(existingLayer);
    }
  });
  if (!map.hasLayer(layer)) {
    map.addLayer(layer);
  }
}

// Añadir la capa TD por defecto y su barra de colores
toggleLayer(TD_corregido_tiles);
updateColorBar('TD Corregido');

// Agregar control de coordenadas del ratón
L.control.mouseCoordinates({ position: 'bottomleft' }).addTo(map);

// Event listener para el cambio de capas
map.on('overlayadd', function (event) {
  updateColorBar(event.name);
  toggleLayer(overlayMaps[event.name]);
});





//============================================================================

// Divisiones paises

function style1(feature) {
  return {
      color: 'black',
      weight: 1,
      fillColor: 'none',
      fillOpacity: 0
  };
}

function style2(feature) {
  return {
      color: 'gray',
      weight: 1,
      fillColor: 'none',
      fillOpacity: 0
  };
}

fetch('./geo/stanford-np147sx1056-geojson.json')
  .then(function (response) {
      return response.json();
  })
  .then(function (data) {
      geojsonLayer = L.geoJson(data, { style: style1 }); // Aplica style1 o style2

      // Agregar la capa GeoJSON al control de capas
      layerControl.addOverlay(geojsonLayer, "Provincias").addTo(map);
  })
  .catch(function (error) {
      console.error('Error al cargar el archivo GeoJSON:', error);
  });

fetch('./geo/stanford-mw786vp6120-geojson.json')
  .then(function (response) {
      return response.json();
  })
  .then(function (data) {
      geojsonLayer = L.geoJson(data, { style: style2 }); // Aplica style1 o style2

      // Agregar la capa GeoJSON al control de capas
      layerControl.addOverlay(geojsonLayer, "Municipios").addTo(map);
  })
  .catch(function (error) {
      console.error('Error al cargar el archivo GeoJSON:', error);
  });

