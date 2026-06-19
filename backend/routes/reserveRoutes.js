const express = require("express");
const router = express.Router();
const {
  reserveSeats,
  cancelReservation,
} = require("../controllers/reserveController");
const { protectRoute } = require("../middleware/authMiddleware");

router.post("/", protectRoute, reserveSeats);

router.delete("/:id", protectRoute, cancelReservation);

module.exports = router;
