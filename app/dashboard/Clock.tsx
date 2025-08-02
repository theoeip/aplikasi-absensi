// app/dashboard/Clock.tsx
'use client';

import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-2xl font-semibold p-4 bg-gray-800 text-white rounded-lg shadow-inner">
      {time.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}
    </div>
  );
}