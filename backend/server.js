const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const startCleanupWorker = require("./workers/reservationCleanup");
const { Server } = require("socket.io");
require("dotenv").config();
const connectDB = require("./config/db");

connectDB();
const app = express();

const server = http.createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);
startCleanupWorker(io);

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Sort My Scene API is online",
  });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/reserve", require("./routes/reserveRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "API Route Not Found" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
