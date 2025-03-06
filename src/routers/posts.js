const express = require('express');
const router = express.Router();

const { createPost, changePostStatus, draftAnswer } = require('../controllers/posts');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

router.post('/post', authenticate, createPost);
router.put('/:postId/status', requireAdmin, changePostStatus);
router.put('/:postId/answer', requireAdmin, draftAnswer);


module.exports = router; 