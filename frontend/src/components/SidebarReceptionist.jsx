import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

const SidebarReceptionist = () => {
  return (
    <div className="sidebar">
        <NavLink to="/receptionist/face-capture" className="sidebar-link">Face Capture</NavLink>
        <NavLink to="/receptionist/patients" className="sidebar-link">Patients</NavLink>
        <NavLink to="/receptionist/add-patient" className="sidebar-link">Add New Patient</NavLink>
        <NavLink to="/receptionist/make-appointment" className="sidebar-link">Make an Appointment</NavLink>
    </div>
  );
};

export default SidebarReceptionist;
