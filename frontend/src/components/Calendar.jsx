import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarComponent = () => {
  const [date, setDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '50px',
      borderRadius: '17px',
      backgroundColor: '#f9f9f9',
      boxShadow: '0 0 10px rgba(0.1, 0.1, 0.1, 0.1)',
      width: 'fit-content',
      marginLeft:'500px',
      marginTop:'20px'
    }}>
      <Calendar
        onChange={setDate}
        value={date}
      />
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', margin: '5px' }}>
          📅 <strong>Date:</strong> {currentTime.toLocaleDateString()}
        </p>
        <p style={{ fontSize: '18px', margin: '5px' }}>
          ⏰ <strong>Time:</strong> {currentTime.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default CalendarComponent;
