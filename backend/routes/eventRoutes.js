const express = require("express");
const router = express.Router();
const { getEvents, getEventSeats } = require("../controllers/eventController");

router.get("/", getEvents);
router.get("/:id/seats", getEventSeats);

module.exports = router;
