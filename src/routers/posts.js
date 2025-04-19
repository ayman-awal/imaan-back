const express = require("express");
const router = express.Router();
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");
const {
  createPost,
  changePostStatus,
  draftAnswer,
  getPublishedPosts,
  getUnpublishedPosts,
  getPostsByUser,
  getPostByPostId,
  getUnpublishedPostById
} = require("../controllers/posts");

router.post("/post", authenticate, createPost);
router.put("/status/:postId", requireAdmin, changePostStatus);
router.put("/answer/:postId", requireAdmin, draftAnswer);

router.get("/feed", getPublishedPosts);
router.get("/unpublished", requireAdmin, getUnpublishedPosts);
router.get("/unpublished/:postId", requireAdmin, getUnpublishedPostById);
router.get("/:postId", getPostByPostId);
router.get("/:userId", requireAdmin, getPostsByUser);

module.exports = router;
