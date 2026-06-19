import { useState, useEffect } from "react";
import apiClient from "../apiClient";

export default function EventList({ onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiClient.get("/events");
        setEvents(response.data.data);
      } catch (err) {
        setError("Failed to load events. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-400 animate-pulse mt-10">
        Loading events...
      </div>
    );
  if (error)
    return (
      <div className="p-4 text-red-400 bg-red-900/30 rounded-lg">{error}</div>
    );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Upcoming Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event._id}
            className="p-6 bg-gray-800 border border-gray-700 rounded-xl shadow-lg hover:border-purple-500 hover:shadow-purple-500/20 transition-all cursor-pointer group"
            onClick={() => onSelectEvent(event._id)}
          >
            <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
              {event.name}
            </h3>
            <p className="mt-2 text-gray-400 text-sm">
              {new Date(event.date).toLocaleDateString()}
            </p>
            <p className="text-gray-400 text-sm">{event.venue}</p>
            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">
                {event.totalSeats} Total Seats
              </span>
              <span className="text-sm font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
                View Seats →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
