const express = require('express');
const router = express.Router();

const { createPost } = require('../controllers/posts');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/post', authenticate, createPost);

module.exports = router; 