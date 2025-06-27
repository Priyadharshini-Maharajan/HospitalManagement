import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SidebarReceptionist from '../components/SidebarReceptionist';
import Navbar from '../components/Navbar';
import Patients from './Patients';
import Appointments from './Appointments';
import AddPatient from './AddPatient';
import MakeAppointment from './MakeAppointment';
import Calendar from '../components/Calendar';
import '../styles/Dashboard.css';
import FaceCapture from './FaceCapture';

const ReceptionistDashboard = () => {
  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-body">
        <SidebarReceptionist />
        <div className="main-content">
          <Routes>
            <Route path="/" element={
              <>
                <h1>Welcome Receptionist</h1>
                <Calendar />
              </>
            } />
            <Route path="face-capture" element={<FaceCapture/>} />
            <Route path="patients" element={<Patients />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="add-patient" element={<AddPatient />} />
            <Route path="make-appointment" element={<MakeAppointment />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
