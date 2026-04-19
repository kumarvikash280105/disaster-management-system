const express = require('express');
const {
  getPendingAuthorities,
  approveAuthority,
} = require('../controllers/validationController');

const router = express.Router();

router.get('/', getPendingAuthorities);
router.patch('/:id/approve', approveAuthority);

module.exports = router;
