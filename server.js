const express = require('express');
const app = express();
const path = require('path');
const authRoutes = require('./src/routes/authRoutes');
const betRoutes = require('./src/routes/betRoutes');
const dataRoutes = require('./src/routes/dataRoutes');
const apuestaRoutes = require('./src/routes/apuestaRoutes');
const { getHistorialPorUsuario, actualizarEstados, eliminarApuestas } = require('./src/controllers/historialController');
require('dotenv').config();

// Middleware para que el servidor entienda formato JSON
app.use(express.json());

// Usar las rutas de autenticación
app.delete('/api/bets/eliminar-masivo', eliminarApuestas);
app.put('/api/bets/actualizar-estado', actualizarEstados);
app.get('/api/bets/historial/:userId', getHistorialPorUsuario);
app.use('/api/auth', authRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/apuestas', apuestaRoutes);
app.get('/api/bets/historial/:userId', getHistorialPorUsuario);
// Esta línea permite que el navegador vea la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

