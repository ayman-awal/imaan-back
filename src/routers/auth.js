const express = require("express");
const router = express.Router();
const { emailVerification } = require("../controllers/auth");

router.get("/verify-email", emailVerification);

module.exports = router;