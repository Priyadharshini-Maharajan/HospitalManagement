import React, { useEffect, useState } from 'react';
import SidebarReceptionist from '../components/SidebarReceptionist';
import Navbar from '../components/Navbar';
import axios from 'axios';
import '../styles/Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    // Fetch matched patients from FastAPI
    const fetchPatients = async () => {
      try {
        const response = await axios.get("http://localhost:8000/match_patients");
        setPatients(response.data);
      } catch (error) {
        console.error("Failed to fetch patients", error);
      }
    };

    fetchPatients();

    // Optional: refresh every 5 seconds
    const interval = setInterval(fetchPatients, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <SidebarReceptionist />
      <div className="main-content">
        <h2 className="patients-title">Matched Patients</h2>
        <table className="patients-table">
          <thead>
            <tr>
              <th>Face</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Diagnosis</th>
              <th>Medical ID</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient, index) => (
              <tr key={index}>
                <td>
                  {patient.face ? (
                    <img src={patient.face} alt={patient.name} className="patient-face" />
                  ) : (
                    <span>No Image</span>
                  )}
                </td>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.diagnosis}</td>
                <td>{patient.medical_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Patients;

