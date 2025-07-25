require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;


// Importar rutas
const productRoutes = require('./routes/productRoutes');

// Usar rutas
app.use('/products', productRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor backend funcionando 🚀');
});

// Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
