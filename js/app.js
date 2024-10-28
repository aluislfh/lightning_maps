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

// Añadir controles al mapa
L.control.zoom({ position: 'topright' }).addTo(map);
L.control.fullscreen({ position: 'topright', title: 'Pantalla completa', titleCancel: 'Salir de pantalla completa' }).addTo(map);
L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(map);
L.control.locate({ position: 'topright', flyTo: true, icon: 'fa fa-location-arrow', strings: { title: "Mostrar mi ubicación" } }).addTo(map);

// Capa base desde caché local (ArcGIS) activada por defecto
const arcGISLayer = L.tileLayer('./cache/ArcGIS_Online_Imagery/{z}/{x}/{y}.jpg', {
  minZoom: 5, maxZoom: 10, maxNativeZoom: 8,
  attribution: 'ArcGIS Imagery'
}).addTo(map);

// Capas adicionales como capas base para que se comporten como botones radio
const TD_corregido_tiles = L.tileLayer('./data/TD_corregido_clipped_rgb_8bit_tiles/{z}/{x}/{y}.png', { tms: true, opacity: 0.8, maxZoom: 10 });
const Ng_tiles = L.tileLayer('./data/Ng_clipped_rgb_8bit_tiles/{z}/{x}/{y}.png', { tms: true, opacity: 0.8, maxZoom: 10 });
const N_corregido_tiles = L.tileLayer('./data/N_corregido-1_clipped_rgb_8bit_tiles/{z}/{x}/{y}.png', { tms: true, opacity: 0.8, maxZoom: 10 });

const baseMaps = {
  "Números promedio de días con tormenta [año/km^2]": TD_corregido_tiles,
  "Densidad promedio de descargas a tierra [año/km^2]": Ng_tiles,
  "Densidad promedio de descargas eléctricas [año/km^2]": N_corregido_tiles
};

// Añadir control de capas en la esquina superior izquierda como radio buttons
const layerControl = L.control.layers(baseMaps, {}, { position: 'topleft', collapsed: false }).addTo(map);

// Seleccionar el contenedor de las barras de color
const colorBarContainer = document.getElementById('colorbars-container');

// Función para actualizar la barra de color según la capa seleccionada
function updateColorBar(selectedLayer) {
  colorBarContainer.innerHTML = '';

  let imgSrc = '';
  if (selectedLayer === 'Números promedio de días con tormenta [año/km^2]') {
    imgSrc = './images/TD_corregido_colorbar.png';
  } else if (selectedLayer === 'Densidad promedio de descargas a tierra [año/km^2]') {
    imgSrc = './images/Ng_colorbar.png';
  } else if (selectedLayer === 'Densidad promedio de descargas eléctricas [año/km^2]') {
    imgSrc = './images/N_corregido-1_colorbar.png';
  }

  if (imgSrc) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = `${selectedLayer} Colorbar`;
    colorBarContainer.appendChild(img);
  }
}

// Inicializa la capa y la barra de color por defecto
TD_corregido_tiles.addTo(map); // Añadir capa inicial por defecto
updateColorBar('Números promedio de días con tormenta [año/km^2]'); // Actualiza la barra de color inicial

// Agregar control de coordenadas del ratón
L.control.mouseCoordinates({ position: 'bottomleft' }).addTo(map);

// Escucha el cambio de capa base para actualizar la barra de color y la capa activa
map.on('baselayerchange', function(event) {
  updateColorBar(event.name);
});



//============================================================================

// Divisiones politicas administrativas

function style1(feature) {
  return {
      color: 'black',
      weight: 3,
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

// Cargar y agregar capa GeoJSON de provincias con style1
fetch('./geo/stanford-np147sx1056-geojson.json')
  .then(function (response) {
      return response.json();
  })
  .then(function (data) {
      const provinciasLayer = L.geoJson(data, { style: style1 });

      // Agregar la capa GeoJSON de provincias al control de capas y al mapa
      layerControl.addOverlay(provinciasLayer, "Provincias");
      provinciasLayer.addTo(map);
  })
  .catch(function (error) {
      console.error('Error al cargar el archivo GeoJSON de provincias:', error);
  });

// Cargar y agregar capa GeoJSON de municipios con style2
fetch('./geo/stanford-mw786vp6120-geojson.json')
  .then(function (response) {
      return response.json();
  })
  .then(function (data) {
      const municipiosLayer = L.geoJson(data, { style: style2 });

      // Agregar la capa GeoJSON de municipios al control de capas y al mapa
      layerControl.addOverlay(municipiosLayer, "Municipios");
      municipiosLayer.addTo(map);
  })
  .catch(function (error) {
      console.error('Error al cargar el archivo GeoJSON de municipios:', error);
  });
