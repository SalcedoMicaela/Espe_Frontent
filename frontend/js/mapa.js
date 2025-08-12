// mapa.js - mapa con OpenStreetMap online + carga datos + ruta segura remota

const map = L.map("map").setView([-0.3297, -78.0947], 13);

// Cargar tiles OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const puntoSeguroIcon = L.icon({
  iconUrl: "assets/iconos/punto_encuentro.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

fetch("data/datos_volcan.geojson")
  .then((response) => response.json())
  .then((data) => {
    L.geoJSON(data, {
      filter: (feature) =>
        (feature.geometry.type === "Point" &&
          feature.properties.es_punto_seguro === true) ||
        feature.geometry.type === "Polygon",
      pointToLayer: (feature, latlng) => {
        if (
          feature.geometry.type === "Point" &&
          feature.properties.es_punto_seguro === true
        ) {
          return L.marker(latlng, { icon: puntoSeguroIcon });
        }
      },
      style: (feature) => {
        if (feature.geometry.type === "Polygon") {
          return { color: "red", weight: 2, fillOpacity: 0.4 };
        }
      },
      onEachFeature: (feature, layer) => {
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
  .catch((error) => console.error("Error cargando GeoJSON:", error));

// Cargar ruta segura desde API remota (solo si tienes internet)
async function cargarRutaSegura() {
  try {
    const response = await fetch("https://espe-1.onrender.com/api/ruta_segura");
    if (!response.ok) throw new Error("Error al cargar ruta segura");

    const ruta = await response.json();

    L.geoJSON(ruta, {
      style: { color: "blue", weight: 4, opacity: 0.7 },
    }).addTo(map);
  } catch (error) {
    console.error("Error cargando ruta segura:", error);
  }
}

window.onload = () => {
  cargarRutaSegura();
};
