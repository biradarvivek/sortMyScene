import { useState, useEffect, useCallback } from "react";
import apiClient from "../apiClient";
import ReservationTimer from "./ReservationTimer";
import { io } from "socket.io-client";

export default function SeatGrid({ eventId, onBack }) {
  const [eventDetails, setEventDetails] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👉 New State Variables for Transaction Management
  const [isReserving, setIsReserving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [reservationLock, setReservationLock] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchSeats = useCallback(async () => {
    try {
      const response = await apiClient.get(`/events/${eventId}/seats`);
      setEventDetails({
        name: response.data.event,
        total: response.data.totalSeats,
      });
      setSeats(response.data.data);
    } catch (err) {
      setError("Failed to fetch the live seat map.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats]);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("seatsUpdated", (data) => {
      if (data.eventId === eventId) {
        console.log("Real-time update received! Refreshing grid silently...");
        fetchSeats();
      }
    });

    return () => socket.disconnect();
  }, [eventId, fetchSeats]);

  const toggleSeatSelection = (seatId, status) => {
    if (status !== "available" || reservationLock || bookingSuccess) return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId],
    );
  };

  const handleReserve = async () => {
    setIsReserving(true);
    setError(null);

    try {
      const response = await apiClient.post("/reserve", {
        eventId,
        seatIds: selectedSeats,
      });

      setReservationLock(response.data.reservation);

      fetchSeats();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to reserve seats.";
      setError(errorMessage);

      if (err.response?.status === 409) {
        setSelectedSeats([]);
        fetchSeats();
      }
    } finally {
      setIsReserving(false);
    }
  };

  const handleConfirmBooking = async () => {
    setIsConfirming(true);
    setError(null);

    try {
      await apiClient.post("/bookings", {
        reservationId: reservationLock._id,
      });

      setBookingSuccess(true);
      fetchSeats();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to confirm booking.");
      if (err.response?.status === 400) {
        setReservationLock(null);
        setSelectedSeats([]);
        fetchSeats();
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleExpiration = useCallback(async () => {
    if (reservationLock) {
      try {
        await apiClient.delete(`/reserve/${reservationLock._id}`);
      } catch (err) {
        console.error("Failed to proactively cancel reservation", err);
      }
    }

    setReservationLock(null);
    setSelectedSeats([]);
    setError(
      "Your reservation window has expired. Please select your seats again.",
    );

    fetchSeats();
  }, [reservationLock, fetchSeats]);

  const getSeatColor = (seat) => {
    if (selectedSeats.includes(seat._id) && !reservationLock)
      return "bg-purple-600 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.6)] text-white";
    if (seat.status === "booked")
      return "bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed opacity-50";
    if (seat.status === "reserved" && selectedSeats.includes(seat._id))
      return "bg-yellow-500 border-yellow-400 text-yellow-900 shadow-[0_0_15px_rgba(234,179,8,0.5)]";
    if (seat.status === "reserved")
      return "bg-yellow-900/50 border-yellow-700 text-yellow-500/50 cursor-not-allowed";
    return "bg-gray-800 border-gray-500 text-gray-300 hover:border-purple-400 hover:bg-gray-700 cursor-pointer";
  };

  if (loading)
    return (
      <div className="text-center text-gray-400 animate-pulse mt-10">
        Syncing with live server...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-white mb-2 flex items-center transition-colors"
          >
            ← Back to Events
          </button>
          <h2 className="text-3xl font-bold text-white">
            {eventDetails?.name}
          </h2>

          {!reservationLock && !bookingSuccess && (
            <p className="text-gray-400">Select your seats below.</p>
          )}
          {reservationLock && !bookingSuccess && (
            <p className="text-yellow-400 font-medium animate-pulse">
              Seats temporarily locked. Please confirm your booking!
            </p>
          )}
          {bookingSuccess && (
            <p className="text-green-400 font-bold">
              🎉 Booking Confirmed! See you at the event.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {error && (
            <div className="text-sm text-red-400 bg-red-900/30 border border-red-800 p-2 rounded-lg max-w-xs">
              {error}
            </div>
          )}

          {!reservationLock && !bookingSuccess && (
            <button
              onClick={handleReserve}
              disabled={selectedSeats.length === 0 || isReserving}
              className="px-6 py-3 font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all"
            >
              {isReserving
                ? "Locking Seats..."
                : `Reserve ${selectedSeats.length} Seat(s)`}
            </button>
          )}

          {reservationLock && !bookingSuccess && (
            <div className="flex items-center space-x-4">
              <ReservationTimer
                expiresAt={reservationLock.expiresAt}
                onExpire={handleExpiration}
              />
              <button
                onClick={handleConfirmBooking}
                disabled={isConfirming}
                className="px-6 py-3 font-bold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg hover:shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-all text-yellow-900"
              >
                {isConfirming ? "Confirming..." : "Complete Booking Now"}
              </button>
            </div>
          )}
          {bookingSuccess && (
            <button
              onClick={onBack}
              className="px-6 py-3 font-bold text-gray-900 bg-white rounded-lg hover:bg-gray-200 transition-all"
            >
              Browse More Events
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4 bg-gray-800 p-4 rounded-lg inline-flex border border-gray-700">
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 border border-gray-500 bg-gray-800 rounded"></div>{" "}
          Available
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 bg-purple-600 rounded"></div> Selected
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 bg-yellow-500 rounded shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>{" "}
          Your Lock
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 bg-gray-700 rounded opacity-50"></div>{" "}
          Booked / Taken
        </div>
      </div>

      <div className="w-full h-8 bg-gradient-to-b from-gray-700 to-gray-900 rounded-t-3xl flex items-center justify-center border-t border-gray-600 shadow-2xl mb-8">
        <span className="text-xs font-bold tracking-[0.5em] text-gray-400 uppercase">
          Stage
        </span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 md:gap-4 max-w-4xl mx-auto pb-10">
        {seats.map((seat) => (
          <div
            key={seat._id}
            onClick={() => toggleSeatSelection(seat._id, seat.status)}
            className={`
              h-10 md:h-12 flex items-center justify-center rounded-t-lg rounded-b-sm border-b-4 text-xs md:text-sm font-semibold transition-all select-none
              ${getSeatColor(seat)}
            `}
          >
            {seat.seatNumber}
          </div>
        ))}
      </div>
    </div>
  );
}
