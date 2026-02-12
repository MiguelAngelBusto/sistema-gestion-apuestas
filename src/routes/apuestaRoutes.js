const express = require('express');
const router = express.Router();
const { crearApuesta } = require('../controllers/apuestaController');

router.post('/', crearApuesta);

module.exports = router;