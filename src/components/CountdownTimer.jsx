import React, { useState, useEffect } from 'react';

export const CountdownTimer = ({ expiry }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Number(expiry) - now;

      if (diff <= 0) {
        setTimeLeft("EXPIRED");
        return;
      }

      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;

      setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [expiry]);

  return <span>{timeLeft}</span>;
}
