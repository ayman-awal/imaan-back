const express = require("express");
const router = express.Router();

const {
  userRegister,
  userLogin,
  getProfile,
  // getProfileByUser,
} = require("../controllers/users");
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");

router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/profile", authenticate, getProfile);
// router.get("/profile/:userId", requireAdmin, getProfileByUser);

module.exports = router;
