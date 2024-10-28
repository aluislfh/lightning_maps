// src_js/app.js

// Inicializar el mapa en el área de Cuba con un zoom inicial de 5
const map = L.map('map', {
  center: [21.25439875782822, -79.52396797010076], // Coordenadas centradas en Cuba
  zoom: 5,
  minZoom: 3,
  maxZoom: 10,
  zoomControl: true
});

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

// Añadir control de ubicación (Locate)
L.control.locate({
  position: 'topright',
  flyTo: true,
  icon: 'fa fa-location-arrow',
  strings: {
    title: "Mostrar mi ubicación" // Texto del tooltip
  }
}).addTo(map);

// Capas base
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map); // Capa base inicial

const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenTopoMap contributors'
});

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

// Control de capas
const baseMaps = {
  "OpenStreetMap": osmLayer,
  "OSM Topo": topoLayer
};

const overlayMaps = {
  "TD Corregido": TD_corregido_tiles,
  "Ng Clipped": Ng_tiles,
  "N Corregido-1": N_corregido_tiles
};

// Añadir control de capas al mapa
L.control.layers(baseMaps, overlayMaps, { position: 'topright', collapsed: false }).addTo(map);
