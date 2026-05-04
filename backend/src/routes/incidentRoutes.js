const express = require('express');
const {
  createIncident,
  listIncidents,
  adminUpdateIncident,
} = require('../controllers/incidentController');

const router = express.Router();

router.get('/', listIncidents);
router.post('/', createIncident);
router.patch('/:id/admin-update', adminUpdateIncident);

module.exports = router;
