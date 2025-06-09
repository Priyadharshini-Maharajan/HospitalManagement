import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import SidebarDoctor from "../components/SidebarDoctor";
import Navbar from "../components/Navbar";
import Calendar from "../components/Calendar";
import Appointments from "./DoctorAppointments";
import Patients from "./DoctorPatients";
import "../styles/Dashboard.css";
import { Outlet} from 'react-router-dom';

const DoctorDashboard = () => {
  const { doctorId } = useParams();

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-body">
      <SidebarDoctor doctorId={doctorId} />
        <div className="main-content">
          {/* Nested route components render here */}
          <Outlet context={{ doctorId }} />
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

