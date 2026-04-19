const express = require('express');
const { listUpdates } = require('../controllers/updateController');

const router = express.Router();

router.get('/', listUpdates);

module.exports = router;
