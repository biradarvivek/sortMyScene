// seeder.js
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Event = require("./models/Event");
const Seat = require("./models/Seat");
const Reservation = require("./models/Reservation");

connectDB();

const seedDatabase = async () => {
  try {
    await Event.deleteMany();
    await Seat.deleteMany();
    await Reservation.deleteMany();
    console.log("Old database records cleared.");

    const dummyEvent = await Event.create({
      name: "Full Stack MERN Architecture Workshop",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      venue: "Bombay Exhibition Centre",
      totalSeats: 50,
    });

    console.log(`Event Created: ${dummyEvent.name}`);

    const seats = [];
    const rows = ["A", "B", "C", "D", "E"];

    for (let i = 0; i < rows.length; i++) {
      for (let j = 1; j <= 10; j++) {
        seats.push({
          eventId: dummyEvent._id,
          seatNumber: `${rows[i]}${j}`,
          status: "available",
        });
      }
    }

    await Seat.insertMany(seats);
    console.log("50 Seats successfully generated and linked to the event.");

    console.log("Database Seeding Complete!");
    process.exit();
  } catch (error) {
    console.error(`Error Seeding Data: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
