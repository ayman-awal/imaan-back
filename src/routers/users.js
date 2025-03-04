const express = require('express');
const router = express.Router();

const { userRegister } = require('../controllers/users');

router.post('/register', userRegister);

module.exports = router; 