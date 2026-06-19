const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    if (
      conn.connection.host.includes("localhost") ||
      conn.connection.host.includes("127.0.0.1")
    ) {
      console.warn(
        "WARNING: Connected to a local MongoDB instance. Transactions may fail unless it is configured as a replica set.",
      );
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
