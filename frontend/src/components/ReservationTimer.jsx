import { useState, useEffect } from "react";

export default function ReservationTimer({ expiresAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const targetTime = new Date(expiresAt).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft("00:00");
        onExpire();
      } else {
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setIsUrgent(minutes < 2);

        setTimeLeft(
          `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (!timeLeft) return null;

  return (
    <div
      className={`font-mono text-xl font-bold flex items-center bg-gray-900 px-4 py-2 rounded-lg border shadow-inner transition-colors duration-300
        ${isUrgent ? "text-red-500 border-red-500/50 animate-pulse" : "text-yellow-400 border-yellow-500/30"}
      `}
    >
      {timeLeft}
    </div>
  );
}
