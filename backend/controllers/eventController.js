const Event = require("../models/Event");
const Seat = require("../models/Seat");
const mongoose = require("mongoose");

const getEvents = async (req, res) => {
  try {
    const events = await Event.find().lean();

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch events",
    });
  }
};

const getEventSeats = async (req, res) => {
  try {
    const { id: eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Event ID format" });
    }

    const event = await Event.findById(eventId).lean();
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const seats = await Seat.find({ eventId })
      .select("-__v -createdAt -updatedAt")
      .sort({ seatNumber: 1 })
      .lean();

    res.status(200).json({
      success: true,
      event: event.name,
      totalSeats: event.totalSeats,
      data: seats,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error: Unable to fetch seats" });
  }
};

module.exports = {
  getEvents,
  getEventSeats,
};
