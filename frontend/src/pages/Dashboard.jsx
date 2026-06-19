import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import EventList from "../components/EventList";
import SeatGrid from "../components/SeatGrid";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <nav className="flex items-center justify-between px-8 py-4 bg-gray-800 border-b border-gray-700 shadow-sm">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Sort My Scene
        </h1>
        <div className="flex items-center space-x-6">
          <span className="text-gray-300">
            Welcome,{" "}
            <span className="font-semibold text-white">{user?.name}</span>
          </span>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600/90 rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl p-8 mx-auto mt-6">
        {!selectedEventId ? (
          <EventList onSelectEvent={setSelectedEventId} />
        ) : (
          <SeatGrid
            eventId={selectedEventId}
            onBack={() => setSelectedEventId(null)}
          />
        )}
      </main>
    </div>
  );
}
