const express = require('express');
const router = express.Router();
// Actualiza esta línea para que traiga AMBAS funciones
const { registrarMovimiento, obtenerMovimientos } = require('../controllers/betController');

router.post('/movimiento', registrarMovimiento);
router.get('/historial/:id_usuario', obtenerMovimientos); 

module.exports = router;