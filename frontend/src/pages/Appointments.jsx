import React from 'react';
import SidebarReceptionist from '../components/SidebarReceptionist';
import Navbar from '../components/Navbar';
import '../styles/Appointments.css';

// Sample static appointment data
const sampleAppointments = [
  {
    id: 1,
    name: "John Doe",
    age: 35,
    gender: "Male",
    diagnosis: "Flu",
    face: "https://randomuser.me/api/portraits/men/32.jpg",
    appointmentDate: "2025-06-05",
    appointmentTime: "10:30 AM",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 28,
    gender: "Female",
    diagnosis: "Allergy",
    face: "https://randomuser.me/api/portraits/women/44.jpg",
    appointmentDate: "2025-06-05",
    appointmentTime: "02:00 PM",
  },
];

const Appointments = () => {
  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <SidebarReceptionist />
      <div className="main-content">
        <h2 className="appointments-title">Appointments</h2>
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Face</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Diagnosis</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {sampleAppointments.map((appt) => (
              <tr key={appt.id}>
                <td><img src={appt.face} alt={appt.name} className="patient-face" /></td>
                <td>{appt.name}</td>
                <td>{appt.age}</td>
                <td>{appt.gender}</td>
                <td>{appt.diagnosis}</td>
                <td>{appt.appointmentDate}</td>
                <td>{appt.appointmentTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Appointments;
