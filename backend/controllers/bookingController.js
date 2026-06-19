const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");
const Seat = require("../models/Seat");

const confirmBooking = async (req, res) => {
  const { reservationId } = req.body;
  const userId = req.user._id;

  if (!reservationId) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid reservationId",
    });
  }

  const reservation = await Reservation.findById(reservationId);

  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: "Reservation not found or has already expired/been processed.",
    });
  }

  if (reservation.userId.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to confirm this booking.",
    });
  }

  if (new Date(reservation.expiresAt) < new Date()) {
    return res.status(400).json({
      success: false,
      message:
        "This reservation has expired. Please restart the booking process.",
    });
  }
  const confirmedSeatIds = reservation.seatIds.map((id) => id.toString());

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Seat.updateMany(
      {
        _id: { $in: reservation.seatIds },
        status: "reserved",
      },
      {
        $set: { status: "booked" },
      },
      { session },
    );

    await Reservation.deleteOne({ _id: reservationId }, { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Booking confirmed! Your seats are permanently secured.",
      bookedSeats: confirmedSeatIds,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Booking Transaction Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process booking. Please try again.",
    });
  }
};

module.exports = { confirmBooking };
