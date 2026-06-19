const mongoose = require("mongoose");
const Seat = require("../models/Seat");
const Reservation = require("../models/Reservation");
const Event = require("../models/Event");

const reserveSeats = async (req, res) => {
  const { eventId, seatIds } = req.body;
  const userId = req.user._id;

  if (!eventId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide an eventId and an array of seatIds",
    });
  }

  const uniqueSeatIds = [...new Set(seatIds)];

  const mappedSeatIds = uniqueSeatIds.map(
    (id) => new mongoose.Types.ObjectId(id),
  );

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updateResult = await Seat.updateMany(
      {
        _id: { $in: mappedSeatIds },
        eventId: eventId,
        status: "available",
      },
      {
        $set: { status: "reserved" },
      },
      { session },
    );

    if (updateResult.modifiedCount !== uniqueSeatIds.length) {
      throw new Error(
        "Race Condition: One or more selected seats are no longer available.",
      );
    }

    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

    const reservation = await Reservation.create(
      [
        {
          userId,
          eventId,
          seatIds: mappedSeatIds,
          expiresAt,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Seats successfully reserved for 10 minutes.",
      reservation: reservation[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error.message.includes("Race Condition")) {
      return res.status(409).json({ success: false, message: error.message });
    }

    console.error("Transaction Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reserve seats. Please try again.",
    });
  }
};

const cancelReservation = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      await session.abortTransaction();
      session.endSession();
      return res.status(200).json({ success: true });
    }

    await Seat.updateMany(
      { _id: { $in: reservation.seatIds }, status: "reserved" },
      { $set: { status: "available" } },
      { session },
    );

    await Reservation.deleteOne({ _id: id }, { session });

    await session.commitTransaction();
    session.endSession();

    const io = req.app.get("io");
    io.emit("seatsUpdated", { eventId: reservation.eventId });

    return res
      .status(200)
      .json({ success: true, message: "Reservation cancelled." });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, message: "Failed to cancel." });
  }
};

module.exports = { reserveSeats, cancelReservation };
