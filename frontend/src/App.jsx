// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDetails from './pages/PatientDetails';
import Calendar from './components/Calendar'; // or wherever it's located
import DoctorAppointments from './pages/DoctorAppointments';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/receptionist/*" element={<ReceptionistDashboard />} />

        {/* DoctorDashboard is a parent layout with nested routes */}
        <Route path="/doctor/:doctorId" element={<DoctorDashboard />}>
          {/* Default index route under doctor/:doctorId */}
          <Route
            index
            element={
              <>
                <h1>Welcome Doctor</h1>
                <Calendar />
              </>
            }
          />
          <Route path="appointments" element={<DoctorAppointments />} />
        </Route>

        {/* Other routes */}
        <Route path="/patientdetails" element={<PatientDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
