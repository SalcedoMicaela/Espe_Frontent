function hablar(mensaje) {
  const synth = window.speechSynthesis;
  if (!synth) {
    console.warn("Síntesis de voz no soportada");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(mensaje);
  synth.speak(utterance);
}

async function iniciarGuiaVoz() {
  if (coordenadasRuta.length === 0) {
    console.warn("No hay ruta para guiar");
    return;
  }

  for (let i = 0; i < coordenadasRuta.length; i++) {
    const [lng, lat] = coordenadasRuta[i];
    hablar(
      `Avanza al punto con latitud ${lat.toFixed(5)} y longitud ${lng.toFixed(
        5
      )}`
    );
    await new Promise((resolve) => setTimeout(resolve, 4000)); // Espera 4 segundos para simular paso
  }
  hablar("Has llegado al destino seguro.");
}
