const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Seat must belong to an event"],
    },
    seatNumber: {
      type: String,
      required: [true, "Seat number is required (e.g., A1, B4)"],
    },
    status: {
      type: String,
      enum: ["available", "reserved", "booked"],
      default: "available",
    },
  },
  { timestamps: true },
);

seatSchema.index({ eventId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model("Seat", seatSchema);
