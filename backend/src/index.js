require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Seguridad HTTP headers
app.use(helmet());

// Logger de peticiones (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiter (ejemplo: max 100 requests por 15 minutos por IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { error: 'Demasiadas solicitudes, intenta más tarde.' },
});
app.use(limiter);

// Importar rutas
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const productSizeRoutes = require('./routes/productSizeRoutes');
const cartRoutes = require('./routes/cartRoutes');
const cartItemRoutes = require('./routes/cartItemRoutes');
const orderRoutes = require('./routes/orderRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const orderItemRoutes = require('./routes/orderItemRoutes');
const addressRoutes = require('./routes/addressRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Usar rutas
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/users', userRoutes);
app.use('/productSizes', productSizeRoutes);
app.use('/cartItems', cartItemRoutes);
app.use('/carts', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/shippings', shippingRoutes);
app.use('/orderItems', orderItemRoutes);
app.use('/addresses', addressRoutes);
app.use('/payments', paymentRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor backend funcionando 🚀');
});

// Middleware para rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Levantar servidor solo si se ejecuta directamente
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
}

module.exports = app;
