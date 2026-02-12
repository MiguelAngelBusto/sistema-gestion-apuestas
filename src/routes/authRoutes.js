const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { login } = require('../controllers/authController');
// Definimos que cuando alguien envíe datos a /registro, use la función del controlador
router.post('/registro', authController.registrarUsuario);
router.post('/login', login);
module.exports = router;
