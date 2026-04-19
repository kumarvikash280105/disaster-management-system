const express = require('express');
const { createIncident, listIncidents } = require('../controllers/incidentController');

const router = express.Router();

router.get('/', listIncidents);
router.post('/', createIncident);

module.exports = router;
