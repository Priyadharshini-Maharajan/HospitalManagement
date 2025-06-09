import React from "react";
import { NavLink, useParams } from "react-router-dom";

const SidebarDoctor = ({ doctorId: propDoctorId }) => {
  // Safely extract doctorId from URL or fallback
  const { doctorId: paramDoctorId } = useParams();
  const doctorId = propDoctorId || paramDoctorId || localStorage.getItem("doctorId");

  return (
    <div className="sidebar">
      <NavLink to={`/doctor/${doctorId}/appointments`} className="sidebar-link">
        Appointments
      </NavLink>
    </div>
  );
};

export default SidebarDoctor;
