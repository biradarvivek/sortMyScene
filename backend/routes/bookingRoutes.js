const express = require("express");
const router = express.Router();
const { confirmBooking } = require("../controllers/bookingController");
const { protectRoute } = require("../middleware/authMiddleware");

router.post("/", protectRoute, confirmBooking);

module.exports = router;
