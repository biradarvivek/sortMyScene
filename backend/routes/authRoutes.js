const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} = require("../controllers/authController");
const { protectRoute } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protectRoute, getMe);
router.post("/logout", logoutUser);

module.exports = router;
