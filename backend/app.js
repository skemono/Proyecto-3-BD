const express = require('express');
const cors = require('cors');
require('dotenv').config();

const initializeDatabase = require('./db/init');
const seedDatabase = require('./db/seed');
const reportesRoutes = require('./routes/reportes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar base de datos y datos iniciales
async function startServer() {
  await initializeDatabase();
  await seedDatabase();
  
  // Rutas
  app.use('/api/reportes', reportesRoutes);

  // Iniciar servidor
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}

startServer();