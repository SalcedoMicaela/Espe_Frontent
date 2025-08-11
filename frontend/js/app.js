// Crear mapa centrado en la zona aproximada
window.map = L.map("map").setView([-0.315, -78.445], 16); // Ajusta el centro y zoom

// Añadir la imagen overlay georreferenciada usando los límites del KML
const imageUrl = "assets/tiles/Espe_Offline_Map/files/Espe_Offline_Map_16.JPG";

// LatLngBounds: [[southWest_lat, southWest_lng], [northEast_lat, northEast_lng]]
const imageBounds = [
  [-0.324095, -78.453369], // southWest (lat, lng)
  [-0.307616, -78.43689], // northEast (lat, lng)
];

L.imageOverlay(imageUrl, imageBounds).addTo(window.map);

// Opcional: Limitar el mapa para que no se mueva fuera del área de la imagen
window.map.setMaxBounds(imageBounds);

// Icono personalizado para puntos seguros (ajusta tamaño y anclaje)
const puntoSeguroIcon = L.icon({
  iconUrl: "./assets/iconos/punto_encuentro.png",
  iconSize: [24, 24], // Tamaño más pequeño
  iconAnchor: [12, 24], // Punto "pegado" al marcador
  popupAnchor: [0, -24], // Popup arriba del icono
});

// Función para cargar y mostrar GeoJSON con filtro y estilos
async function cargarDatosGeoJSON() {
  try {
    const response = await fetch("./data/datos_volcan.geojson");
    if (!response.ok) throw new Error("No se pudo cargar el GeoJSON");

    const data = await response.json();

    L.geoJSON(data, {
      filter: function (feature) {
        // Mostrar puntos seguros y polígonos de riesgo
        return (
          (feature.geometry.type === "Point" &&
            feature.properties.es_punto_seguro === true) ||
          feature.geometry.type === "Polygon"
        );
      },
      pointToLayer: function (feature, latlng) {
        if (
          feature.geometry.type === "Point" &&
          feature.properties.es_punto_seguro === true
        ) {
          return L.marker(latlng, { icon: puntoSeguroIcon });
        }
      },
      style: function (feature) {
        if (feature.geometry.type === "Polygon") {
          return {
            color: "red",
            weight: 2,
            fillOpacity: 0.4,
          };
        }
      },
      onEachFeature: function (feature, layer) {
        if (feature.geometry.type === "Point" && feature.properties.id_osm) {
          layer.bindPopup(
            `Punto seguro<br>ID OSM: ${feature.properties.id_osm}`
          );
        } else if (
          feature.geometry.type === "Polygon" &&
          feature.properties.tipo_riesgo
        ) {
          layer.bindPopup(
            `Zona de riesgo: ${feature.properties.tipo_riesgo}<br>` +
              `Factor penalización: ${feature.properties.factor_penalizacion}`
          );
        }
      },
    }).addTo(window.map);
  } catch (error) {
    console.error("Error cargando GeoJSON:", error);
  }
}

// Ejecutar carga GeoJSON al cargar la página
window.onload = () => {
  cargarDatosGeoJSON();
};
