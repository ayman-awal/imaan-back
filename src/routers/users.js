const express = require('express');
const router = express.Router();

const { userRegister, userLogin, getProfile } = require('../controllers/users');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', userRegister);
router.post('/login', userLogin);
router.get('/profile', authenticate, getProfile);

module.exports = router; 