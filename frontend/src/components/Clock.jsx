import React, { useState, useEffect } from 'react';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p><strong>Date:</strong> {time.toLocaleDateString()}</p>
      <p><strong>Time:</strong> {time.toLocaleTimeString()}</p>
    </div>
  );
};

export default Clock;
