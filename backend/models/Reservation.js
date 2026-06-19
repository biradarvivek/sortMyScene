const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reservation must belong to a user"],
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Reservation must be linked to an event"],
    },
    seatIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seat",
        required: true,
      },
    ],
    expiresAt: {
      type: Date,
      required: [true, "Expiration time is required"],
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Reservation", reservationSchema);
