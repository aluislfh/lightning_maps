// src_js/app.js

// Inicializar el mapa en el área de Cuba con un zoom inicial de 5
const map = L.map('map', {
    center: [21.25439875782822, -79.52396797010076], // Coordenadas de Cuba
    zoom: 5,
    minZoom: 3,
    maxZoom: 10,
    zoomControl: false // Desactivar el control de zoom predeterminado
  });
  
  // Añadir controles de zoom en la esquina superior derecha
  L.control.zoom({
    position: 'topright'
  }).addTo(map);
  
  // Añadir control de pantalla completa en la esquina superior derecha
  L.control.fullscreen({
    position: 'topright',
    title: 'Pantalla completa',
    titleCancel: 'Salir de pantalla completa'
  }).addTo(map);
  
  // Añadir escala en kilómetros en la esquina inferior izquierda
  L.control.scale({
    metric: true,
    imperial: false,
    position: 'bottomleft'
  }).addTo(map);
  
  // Capas base de OpenStreetMap y CartoDB Positron
  const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map); // Capa base inicial
  
  const cartoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors, &copy; CartoDB'
  });
  
  // Capas de tiles para los diferentes mapas
  const TD_corregido_tiles = L.tileLayer('/data/TD_corregido_clipped_rgb_8bit_tiles/{z}/{x}/{y}.png', {
    tms: true, opacity: 0.7, maxZoom: 10
  }).addTo(map); // Capa de overlay inicial
  
  const Ng_tiles = L.tileLayer('/data/Ng_clipped_rgb_8bit_tiles/{z}/{x}/{y}.png', { tms: true, maxZoom: 10 });
  const N_corregido_tiles = L.tileLayer('/data/N_corregido-1_clipped_rgb_8bit_tiles/{z}/{x}/{y}.png', { tms: true, maxZoom: 10 });
  
  // La capa de mapa activa inicialmente
  let activeLayer = TD_corregido_tiles;
  
  // Listeners para los botones del sidebar, para alternar entre las capas de tiles
  document.getElementById('btn-layer1').onclick = function () {
    if (activeLayer) map.removeLayer(activeLayer);
    activeLayer = TD_corregido_tiles.addTo(map);
  };
  
  document.getElementById('btn-layer2').onclick = function () {
    if (activeLayer) map.removeLayer(activeLayer);
    activeLayer = Ng_tiles.addTo(map);
  };
  
  document.getElementById('btn-layer3').onclick = function () {
    if (activeLayer) map.removeLayer(activeLayer);
    activeLayer = N_corregido_tiles.addTo(map);
  };
  
  // Añadir control de capas para cambiar entre OpenStreetMap y CartoDB Positron
  const baseMaps = {
    "OpenStreetMap": osmLayer,
    "CartoDB Positron": cartoLayer
  };
  
  // Overlay layers para los mapas personalizados
  const overlayMaps = {
    "TD Corregido": TD_corregido_tiles,
    "Ng Clipped": Ng_tiles,
    "N Corregido-1": N_corregido_tiles
  };
  
  // Añadir el control de capas en la esquina superior derecha
  L.control.layers(baseMaps, overlayMaps, { position: 'topright', collapsed: false }).addTo(map);
  
  // Añadir título en la esquina superior izquierda
  const title = L.control({ position: 'topleft' });
  title.onAdd = function () {
    const div = L.DomUtil.create('div', 'ctl title');
    div.innerHTML = "<strong>TD_corregido_clipped_rgb_8bit.vrt</strong>";
    return div;
  };
  title.addTo(map);
  