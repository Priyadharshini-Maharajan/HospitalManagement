import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import DoctorDashboard from './pages/DoctorDashboard'; 
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorPatients from './pages/DoctorPatients';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/doctor/:doctorId/*" element={<DoctorDashboard />}>
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients" element={<DoctorPatients />} />
        </Route>

        <Route path="/receptionist" element={<ReceptionistDashboard />} />
        <Route path="/receptionist/patients" element={<ReceptionistPatients />} />
        <Route path="/receptionist/appointments" element={<ReceptionistAppointments />} />
        <Route path="/receptionist/add-patient" element={<AddPatient />} />
        <Route path="/receptionist/make-appointment" element={<MakeAppointment />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
