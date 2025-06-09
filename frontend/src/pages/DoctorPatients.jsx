import React, { useState } from 'react';
import SidebarDoctor from '../components/SidebarDoctor';
import Navbar from '../components/Navbar';
import '../styles/DoctorPatientView.css';

// Sample patients data (replace with real data or fetch from API)
const initialPatients = [
  {
    id: 1,
    name: 'John Doe',
    age: 35,
    gender: 'Male',
    diagnosis: 'Flu',
    address: '123 Main St',
    height: 175,
    weight: 70,
    bloodSugarLevel: 95,
    bloodPressure: '120/80',
    face: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 2,
    name: 'Jane Smith',
    age: 28,
    gender: 'Female',
    diagnosis: 'Allergy',
    address: '456 Elm St',
    height: 165,
    weight: 60,
    bloodSugarLevel: 88,
    bloodPressure: '115/75',
    face: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
];

const DoctorPatients = () => {
  const [patients, setPatients] = useState(initialPatients);
  const [selectedId, setSelectedId] = useState(null);

  const selectedPatient = patients.find((p) => p.id === selectedId);

  const handleChange = (field, value) => {
    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === selectedId ? { ...patient, [field]: value } : patient
      )
    );
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <SidebarDoctor />
      <main className="main-content">
        <h2>Patients</h2>
        <div className="patients-container">
          <div className="patients-list">
            <h3>All Patients</h3>
            <ul>
              {patients.map(({ id, name, age, gender, diagnosis, face }) => (
                <li
                  key={id}
                  className={selectedId === id ? 'selected' : ''}
                  onClick={() => setSelectedId(id)}
                >
                  <img src={face} alt={name} className="patient-face" />
                  <div className="patient-info">
                    <p><strong>{name}</strong></p>
                    <p>{age} years, {gender}</p>
                    <p>Diagnosis: {diagnosis}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {selectedPatient && (
            <div className="patient-details">
              <h3>Patient Details</h3>
              <form onSubmit={(e) => e.preventDefault()}>
                <label>
                  Name:
                  <input
                    type="text"
                    value={selectedPatient.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </label>
                <label>
                  Age:
                  <input
                    type="number"
                    value={selectedPatient.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                  />
                </label>
                <label>
                  Gender:
                  <input
                    type="text"
                    value={selectedPatient.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  />
                </label>
                <label>
                  Diagnosis:
                  <input
                    type="text"
                    value={selectedPatient.diagnosis}
                    onChange={(e) => handleChange('diagnosis', e.target.value)}
                  />
                </label>
                <label>
                  Address:
                  <input
                    type="text"
                    value={selectedPatient.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </label>
                <label>
                  Height (cm):
                  <input
                    type="number"
                    value={selectedPatient.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                  />
                </label>
                <label>
                  Weight (kg):
                  <input
                    type="number"
                    value={selectedPatient.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                  />
                </label>
                <label>
                  Blood Sugar Level:
                  <input
                    type="number"
                    value={selectedPatient.bloodSugarLevel}
                    onChange={(e) => handleChange('bloodSugarLevel', e.target.value)}
                  />
                </label>
                <label>
                  Blood Pressure:
                  <input
                    type="text"
                    value={selectedPatient.bloodPressure}
                    onChange={(e) => handleChange('bloodPressure', e.target.value)}
                  />
                </label>
                <button onClick={() => alert('Patient info saved!')}>
                  Save
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorPatients;
