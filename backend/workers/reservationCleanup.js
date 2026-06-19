const cron = require("node-cron");
const Reservation = require("../models/Reservation");
const Seat = require("../models/Seat");

const startCleanupWorker = (io) => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const expiredReservations = await Reservation.find({
        expiresAt: { $lt: now },
      });

      if (expiredReservations.length === 0) return;

      const seatIdsToRelease = [];
      const reservationIdsToDelete = [];
      const affectedEvents = new Set();

      expiredReservations.forEach((reservation) => {
        seatIdsToRelease.push(...reservation.seatIds);
        reservationIdsToDelete.push(reservation._id);
        affectedEvents.add(reservation.eventId.toString());
      });

      await Seat.updateMany(
        { _id: { $in: seatIdsToRelease }, status: "reserved" },
        { $set: { status: "available" } },
      );

      await Reservation.deleteMany({ _id: { $in: reservationIdsToDelete } });

      affectedEvents.forEach((eventId) => {
        io.emit("seatsUpdated", { eventId });
      });

      console.log(`✅ Cron Worker: Released ${seatIdsToRelease.length} seats.`);
    } catch (error) {
      console.error("❌ Cron Worker Error:", error);
    }
  });
};

module.exports = startCleanupWorker;
