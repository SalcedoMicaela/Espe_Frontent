// Crear mapa centrado en Sangolquí
const map = L.map("map").setView([-0.3297, -78.0947], 13);

// Cargar tiles de OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Definir icono personalizado para puntos seguros
const puntoSeguroIcon = L.icon({
  iconUrl: "assets/iconos/punto_encuentro.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Cargar y mostrar datos GeoJSON
fetch("data/datos_volcan.geojson")
  .then((response) => response.json())
  .then((data) => {
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
          // Estilo para polígonos de riesgo
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
    }).addTo(map);
  })
  .catch((error) => {
    console.error("Error cargando el GeoJSON:", error);
  });
