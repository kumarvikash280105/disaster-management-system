const express = require('express');
const { createSubscription } = require('../controllers/subscriptionController');

const router = express.Router();

router.post('/', createSubscription);

module.exports = router;
