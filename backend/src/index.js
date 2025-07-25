require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Importar rutas
const productRoutes = require('./routes/productRoutes');  // Ajustá la ruta si lo movés a src/routes

// Usar rutas
app.use('/products', productRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.send('Servidor backend funcionando 🚀');
});

// Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
