const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Event date and time are required"],
    },
    venue: {
      type: String,
      required: [true, "Venue name is required"],
      trim: true,
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats capacity is required"],
      min: [1, "Must have at least 1 seat"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Event", eventSchema);
