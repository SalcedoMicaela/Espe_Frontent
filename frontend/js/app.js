// app.js

const BACKEND_URL = "https://espe-1.onrender.com";

// Crear mapa centrado en la zona aproximada
window.map = L.map("map").setView([-0.315, -78.445], 16);

// Imagen overlay georreferenciada
const imageUrl = "assets/tiles/Espe_Offline_Map/files/Espe_Offline_Map_16.JPG";
const imageBounds = [
  [-0.324095, -78.453369], // SW
  [-0.307616, -78.43689], // NE
];
L.imageOverlay(imageUrl, imageBounds).addTo(window.map);
window.map.setMaxBounds(imageBounds);

// Icono personalizado para puntos seguros
const puntoSeguroIcon = L.icon({
  iconUrl: "./assets/iconos/punto_encuentro.png",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

let marcadorUsuario = null;
let capaRutaSegura = null;

// Cargar puntos seguros y zonas desde GeoJSON local
async function cargarDatosGeoJSON() {
  try {
    const response = await fetch("./data/datos_volcan.geojson");
    if (!response.ok) throw new Error("No se pudo cargar el GeoJSON");

    const data = await response.json();

    L.geoJSON(data, {
      filter: (feature) =>
        (feature.geometry.type === "Point" &&
          feature.properties.es_punto_seguro === true) ||
        feature.geometry.type === "Polygon",
      pointToLayer: (feature, latlng) =>
        feature.geometry.type === "Point"
          ? L.marker(latlng, { icon: puntoSeguroIcon })
          : null,
      style: (feature) =>
        feature.geometry.type === "Polygon"
          ? { color: "red", weight: 2, fillOpacity: 0.4 }
          : null,
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
    }).addTo(window.map);
  } catch (error) {
    console.error("Error cargando GeoJSON:", error);
  }
}

// Mostrar ubicación actual del usuario y guardar marcador
function mostrarUbicacionActual() {
  if (!navigator.geolocation) {
    alert("Geolocalización no es soportada por este navegador");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const latlng = [pos.coords.latitude, pos.coords.longitude];

      // Si ya hay marcador, actualizar posición
      if (marcadorUsuario) {
        marcadorUsuario.setLatLng(latlng);
      } else {
        marcadorUsuario = L.marker(latlng)
          .addTo(window.map)
          .bindPopup("Tu ubicación")
          .openPopup();
      }

      window.map.setView(latlng, 17);
    },
    (err) => {
      alert("Error al obtener ubicación: " + err.message);
    }
  );
}

// Solicitar ruta segura al backend y dibujarla en el mapa
async function buscarRutaSegura() {
  if (!marcadorUsuario) {
    alert("No se ha detectado tu ubicación aún.");
    return;
  }

  const { lat, lng } = marcadorUsuario.getLatLng();

  try {
    const response = await fetch(`${BACKEND_URL}/api/ruta_segura`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon: lng }),
    });

    if (!response.ok) throw new Error("Error al obtener la ruta segura");

    const rutaGeoJSON = await response.json();

    // Si ya hay ruta dibujada, la eliminamos antes
    if (capaRutaSegura) {
      const bounds = capaRutaSegura.getBounds();
      const center = bounds.getCenter();

      // Calcular tamaño aproximado de la ruta
      const sizeLat = Math.abs(bounds.getNorth() - bounds.getSouth());
      const sizeLng = Math.abs(bounds.getEast() - bounds.getWest());

      // Si la ruta es pequeña, mantenemos zoom fijo
      if (sizeLat < 0.0005 && sizeLng < 0.0005) {
        window.map.setView(center, 17); // Zoom fijo para rutas cortas
      } else {
        window.map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 17, // evita zoom excesivo
        });
      }
    }

    capaRutaSegura = L.geoJSON(rutaGeoJSON, {
      style: { color: "blue", weight: 4, opacity: 0.8 },
    }).addTo(window.map);

    // Centrar el mapa en la ruta
    window.map.fitBounds(capaRutaSegura.getBounds());

    console.log("Ruta segura cargada");
  } catch (error) {
    console.error("Error:", error);
    alert("No se pudo obtener la ruta segura.");
  }
}
function errorCallback(err) {
  console.error("Error de geolocalización:", err);
  alert(`Error al obtener ubicación: ${err.message} (código ${err.code})`);
}

// Evento botón para buscar ruta segura
document
  .getElementById("btnBuscarRuta")
  .addEventListener("click", buscarRutaSegura);

// Al cargar la página
window.onload = () => {
  cargarDatosGeoJSON();
  mostrarUbicacionActual();
  buscarRutaSegura();
};
