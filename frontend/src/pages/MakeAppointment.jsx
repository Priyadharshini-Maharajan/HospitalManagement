import React, { useEffect, useState } from 'react';
import SidebarReceptionist from '../components/SidebarReceptionist';
import Navbar from '../components/Navbar';
import '../styles/MakeAppointment.css';
import axios from 'axios';

const MakeAppointment = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [reason, setReason] = useState('');
  const [department, setDepartment] = useState('');
  const [doctor, setDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [blood_pressure, setBloodPressure] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          axios.get('http://localhost:8000/patients'),
          axios.get('http://localhost:8000/doctors')
        ]);
        setPatients(patientsRes.data);
        setDoctors(doctorsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);
  const updatePatientDetails = async () => {
    try {
      const payload = {
        height,
        weight,
        blood_pressure: bloodPressure
      };
  
      await axios.put(`http://localhost:8000/patients/${selectedPatient._id}`, payload);
      alert("✅ Patient details updated.");
    } catch (error) {
      console.error("Error updating patient:", error);
      alert("❌ Failed to update patient details.");
    }
  };
  
  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setReason('');
    setDepartment('');
    setDoctor('');
    setAppointmentDate('');
    setAppointmentTime('');
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!appointmentDate || !appointmentTime || !reason || !department || !doctor) {
      alert('Please fill out all appointment details.');
      return;
    }
  
    try {
      // 1. Update patient details
      await updatePatientDetails();
  
      // 2. Proceed with appointment creation
      const selectedDoctor = doctors.find(d => d._id === doctor);
      const appointmentData = {
        patient_id: selectedPatient._id,
        doctor_id: doctor,
        department,
        date: appointmentDate,
        time: appointmentTime,
        reason
      };
  
      const res = await axios.post('http://localhost:8000/appointments', appointmentData);
      const { visitType } = res.data;
  
      if (visitType === "sudden") {
        alert('⚠️ Sudden Visit: The appointment is before the advised date.');
      } else if (visitType === "expected") {
        alert('✅ Expected Visit: The appointment is on the advised date.');
      } else if (visitType === "late") {
        alert('⚠️ Late Visit: The appointment is after the advised date.');
      } else {
        alert(`✅ Appointment created. Visit type: ${visitType}`);
      }
  
      alert(`Appointment created for ${selectedPatient.name} with ${selectedDoctor?.name}`);
  
      // Reset form
      setSelectedPatient(null);
      setReason('');
      setDepartment('');
      setDoctor('');
      setAppointmentDate('');
      setAppointmentTime('');
      setHeight('');
      setWeight('');
      setBloodPressure('');
    } catch (error) {
      console.error('Failed to create appointment:', error);
      alert('❌ Failed to create appointment.');
    }
  };
  
  


    
  const departments = Array.from(new Set(
    doctors.filter(doc => doc.department).map(doc => doc.department.trim())
  ));

  const filteredDoctors = doctors.filter(doc =>
    doc.department && doc.department.toLowerCase() === department.toLowerCase()
  );

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <SidebarReceptionist />
      <div className="main-content">
        <h2 className="make-appointment-title">Make an Appointment</h2>

        {loading ? <p>Loading data...</p> : (
          <div className="make-appointment-container">
            <div className="patients-list">
              <h3>Select a Patient</h3>
              <input
                type="text"
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="patient-search-bar"
              />
              <ul>
                {patients
                  .filter(p =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((patient, index) => (
                    <li
                      key={index}
                      className={selectedPatient?.name === patient.name ? 'selected' : ''}
                      onClick={() => handlePatientClick(patient)}
                    >
                      <div className="patient-face-placeholder">👤</div>
                      <div className="patient-info">
                        <p><strong>{patient.name}</strong></p>
                        <p>{patient.age} years</p>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>

            {selectedPatient && (
              <div className="appointment-form">
          
              


                <form onSubmit={handleSubmit}> 
                <h3>Patient Details</h3>

                  <label>
                    Height:
                    <input
                      type="text"
                      value={height}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Weight:
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    BloodPressure:
                    <input
                      type="bloo"
                      value={blood_pressure}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    />
                  </label>

                  <button type="submit">Update Details</button>
                </form>
              </div>
            )}


            {selectedPatient && (
              <div className="appointment-form">
          
              


                <form onSubmit={handleSubmit}> 
                <h3>Appointment Details</h3>

                  <label>
                    Reason for Visit:
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Department:
                    <select
                      value={department}
                      onChange={(e) => {
                        setDepartment(e.target.value);
                        setDoctor('');
                      }}
                      required
                    >
                      <option value="">Select department</option>
                      {departments.map(dep => (
                        <option key={dep} value={dep}>{dep}</option>
                      ))}
                    </select>
                  </label>

                  {department && (
                    <label>
                      Doctor:
                      <select
                        value={doctor}
                        onChange={(e) => setDoctor(e.target.value)}
                        required
                      >
                        <option value="">Select doctor</option>
                        {filteredDoctors.map(doc => (
                          <option key={doc._id} value={doc._id}>{doc.name}</option>
                        ))}
                      </select>
                    </label>
                  )}

                  <label>
                    Date:
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Time:
                    <input
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      required
                    />
                  </label>

                  <button type="submit">Make Appointment</button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MakeAppointment;


