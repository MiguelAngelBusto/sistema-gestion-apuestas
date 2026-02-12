const express = require('express');
const router = express.Router();
const { getFormResources } = require('../controllers/dataController');

router.get('/resources', getFormResources);

module.exports = router;