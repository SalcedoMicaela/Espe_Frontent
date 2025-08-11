// Geolocalización con marcador dinámico, usa window.map que fue creado en app.js
const iconUbicacion = L.icon({
  iconUrl: "assets/iconos/ubi.png", // pon aquí la ruta correcta relativa a tu HTML
  iconSize: [32, 32], // ajusta el tamaño según tu imagen
  iconAnchor: [16, 32], // punto del icono que estará en la coordenada exacta (normalmente mitad ancho, base del icono)
  popupAnchor: [0, -32], // dónde aparecerá el popup relativo al icono
});

if ("geolocation" in navigator) {
  navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      if (window.marcadorUsuario) {
        window.marcadorUsuario.setLatLng([lat, lon]);
      } else {
        window.marcadorUsuario = L.marker([lat, lon], {
          icon: iconUbicacion,
        }).addTo(map);
        window.marcadorUsuario.bindPopup("Tu ubicación actual").openPopup();
      }

      if (!window.primeraVezCentrado) {
        window.map.setView([lat, lon], 15);
        window.primeraVezCentrado = true;
      }
    },
    (err) => {
      console.error("Error de geolocalización:", err);
      alert("Error al obtener ubicación: " + err.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
} else {
  alert("Tu navegador no soporta geolocalización.");
}
