const axios = require('axios');

const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

async function calcularPesoVolumetrico(largo, ancho, alto) {
  const res = await axios.post(
    'https://correo-argentino1.p.rapidapi.com/calcularPesoVol',
    { largo, ancho, alto },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    }
  );
  return Number(res.data.peso); // Ajustar según respuesta real
}

async function calcularCostoEnvio({ cpOrigen, cpDestino, provinciaOrigen, provinciaDestino, peso }) {
  const res = await axios.post(
    'https://correo-argentino1.p.rapidapi.com/calcularPrecio',
    { cpOrigen, cpDestino, provinciaOrigen, provinciaDestino, peso },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    }
  );

  // Según docs de RapidAPI, elegir el tipo de envío
  return res.data?.paqarClasico?.aDomicilio ;
}

module.exports = {
  calcularPesoVolumetrico,
  calcularCostoEnvio,
};
