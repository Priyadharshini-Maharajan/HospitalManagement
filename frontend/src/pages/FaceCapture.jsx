import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import '../css/FaceCapture.css'; // Optional if you have styles

const API_ENDPOINT = 'http://localhost:8000/match_face/';

const FaceCapture = () => {
  const webcamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);

  const captureAndSend = async () => {
    if (webcamRef.current && webcamRef.current.getScreenshot) {
      const screenshot = webcamRef.current.getScreenshot();
      const blob = await (await fetch(screenshot)).blob();

      const formData = new FormData();
      formData.append('file', blob, 'face.jpg');

      try {
        await axios.post(API_ENDPOINT, formData);
        // No need to set or display any match result
      } catch (err) {
        console.error('Error sending frame:', err);
      }
    }
  };

  useEffect(() => {
    let interval;
    if (cameraOn) {
      interval = setInterval(() => {
        captureAndSend();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [cameraOn]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Face Recognition</h2>
      {cameraOn && (
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: 'user',
          }}
        />
      )}
      <div style={{ margin: '20px' }}>
        <button onClick={() => setCameraOn(true)}>Start Camera</button>
        <button onClick={() => setCameraOn(false)}>Stop Camera</button>
      </div>
    </div>
  );
};

export default FaceCapture;
