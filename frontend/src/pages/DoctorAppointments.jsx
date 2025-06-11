import React, { useState, useEffect } from "react";
import SidebarDoctor from "../components/SidebarDoctor";
import Navbar from "../components/Navbar";
import "../styles/DoctorAppointment.css";
import { useOutletContext } from 'react-router-dom';

const DoctorAppointments = () => {
const { doctorId } = useOutletContext();
const [appointments, setAppointments] = useState([]);
const [selectedId, setSelectedId] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [visitLogs, setVisitLogs] = useState([]);
const [doctorDiagnosis, setDoctorDiagnosis] = useState("");
const [remarks, setRemarks] = useState("");
const [nextAdvisedDate, setNextAdvisedDate] = useState("");

  useEffect(() => {
    if (!doctorId) return;

    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:8000/appointments/doctor/${doctorId}`
        );
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
        const data = await response.json();
        console.log("Fetched appointments:", data);
        data.sort((a, b) =>
          a.appointmentDate.localeCompare(b.appointmentDate) ||
          a.appointmentTime.localeCompare(b.appointmentTime)
        );
        setAppointments(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
          setDoctorDiagnosis(data[0].doctorDiagnosis || "");
          setRemarks(data[0].remarks || "");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  // Fetch visit logs for selected appointment's patient
  useEffect(() => {
    const fetchVisitLogs = async () => {
      if (!selectedId) {
        setVisitLogs([]);
        return;
      }

      try {
        const selectedAppointment = appointments.find((appt) => appt.id === selectedId);
        if (!selectedAppointment) return;

        const patientId = selectedAppointment.patient_id;

        const response = await fetch(
          `http://localhost:8000/appointments/patient/${patientId}/visit_logs`
        );
        if (!response.ok) throw new Error("Failed to fetch visit logs");

        const data = await response.json();
        setVisitLogs(data);
      } catch (err) {
        console.error("Error fetching visit logs:", err);
        setVisitLogs([]);
      }
    };

    fetchVisitLogs();
  }, [selectedId, appointments]);

  const selectedAppointment = appointments.find((appt) => appt.id === selectedId);

  const handleDeleteAppointment = async (appointmentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this appointment?");
    if (!confirmDelete) return;
  
    try {
      const response = await fetch(`http://localhost:8000/appointments/${appointmentId}`, {
        method: "DELETE",
      });
  
      const data = await response.json();
      alert(data.message);
  
      // Remove from state
      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
  
      if (selectedId === appointmentId) {
        setSelectedId(null);
      }
    } catch (err) {
      alert("Failed to delete appointment: " + err.message);
    }
  };
  

  const handleAddVisitLog = async () => {
    if (!selectedId) return alert("No appointment selected");

    try {
      const visitEntry = {
        date: selectedAppointment.appointmentDate,
        time: selectedAppointment.appointmentTime,
        reason: selectedAppointment.patient.reasonForVisit || "",
        diagnosis: doctorDiagnosis,
        remarks: remarks,
        nextAdvisedDate: nextAdvisedDate || null,
      };

      const response = await fetch(
        `http://localhost:8000/appointments/${selectedId}/log_visit`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(visitEntry),
        }
      );

      const data = await response.json();
      alert(data.message);

      // Refresh visit logs after adding
      const logsResponse = await fetch(
        `http://localhost:8000/appointments/patient/${selectedAppointment.patient_id}/visit_logs`
      );
      const logsData = await logsResponse.json();
      setVisitLogs(logsData);
    } catch (error) {
      alert("Failed to save visit log: " + error.message);
    }

    
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <SidebarDoctor />
      <main className="main-content">
        <h2>Appointments</h2>

        {loading && <p>Loading appointments...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && appointments.length === 0 && <p>No appointments found.</p>}

        {!loading && !error && appointments.length > 0 && (
          <div className="appointments-container">
            <div className="appointments-list">
              <h3>Patients with Appointments</h3>
              <ul>
                {appointments.map(({ id, patient, appointmentDate, appointmentTime}) => (
                  <li
                    key={id}
                    className={selectedId === id ? "selected" : ""}
                    onClick={() => {
                      setSelectedId(id);
                      const appt = appointments.find((a) => a.id === id);
                      setDoctorDiagnosis(appt.doctorDiagnosis || "");
                      setRemarks(appt.remarks || "");
                    }}
                  >
                    <span
                      className="delete-icon"
                      
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent click from selecting the patient
                        handleDeleteAppointment(id);
                      }}
                      title="Delete"
                    >
                      x
                    </span>
                    
                    <img src={patient.face} alt={patient.name} className="patient-face" />
                    <div className="patient-info">
                      <p>
                        <strong>{patient.name}</strong>
                      </p>
                      <p>
                        {patient.age} years, {patient.gender}
                      </p>
                      <p>Diagnosis: {patient.diagnosis || "N/A"}</p>
                      <p>
                        Appointment: {appointmentDate} at {appointmentTime}
                      </p>
                      
                    
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {selectedAppointment && (
              <div className="appointment-details">
                <h3>Patient Details & Diagnosis</h3>
                {selectedAppointment.visitType === "sudden" && (
                  <p style={{ color: "red", fontWeight: "bold", fontSize: "16px" }}>
                    ⚠️ This is a Sudden Visit
                  </p>
                )}

                {selectedAppointment.visitType === "expected" && (
                  <p style={{ color: "green", fontWeight: "bold", fontSize: "16px" }}>
                    ✅ This is an Expected Visit
                  </p>
                )}

                {selectedAppointment.visitType === "late" && (
                  <p style={{ color: "orange", fontWeight: "bold", fontSize: "16px" }}>
                    ⏰ This is a Late Visit
                  </p>
                )}

                <form onSubmit={(e) => e.preventDefault()}>
                  <label>
                    Name:
                    <input type="text" value={selectedAppointment.patient.name} readOnly />
                  </label>
                  <label>
                    Age:
                    <input type="number" value={selectedAppointment.patient.age}  />
                  </label>
                  <label>
                    Gender:
                    <input type="text" value={selectedAppointment.patient.gender} readOnly />
                  </label>
                  <label>
                    Address:
                    <input type="text" value={selectedAppointment.patient.address} readOnly />
                  </label>
                  <label>
                    Height (cm):
                    <input type="number" value={selectedAppointment.patient.height} />
                  </label>
                  <label>
                    Weight (kg):
                    <input type="number" value={selectedAppointment.patient.weight}  />
                  </label>
                  <label>
                    Blood Pressure:
                    <input type="text" value={selectedAppointment.patient.bloodPressure}  />
                  </label>
                  <label>
                    Reason for Visit:
                    <textarea value={selectedAppointment.patient.reasonForVisit} readOnly />
                  </label>

                  <label>
                    Diagnosis:
                    <textarea
                      value={doctorDiagnosis}
                      onChange={(e) => setDoctorDiagnosis(e.target.value)}
                      placeholder="Enter diagnosis here"
                    />
                  </label>

                  <label>
                    Remarks:
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter remarks here"
                    />
                  </label>

                  <label>
                    Next Advised Date:
                    <input
                      type="date"
                      value={nextAdvisedDate}
                      onChange={(e) => setNextAdvisedDate(e.target.value)}
                    />
                  </label>


                  <button type="button" onClick={handleAddVisitLog}>
                    Save Visit Log
                  </button>
                </form>

                <div className="visit-history">
                  <h3>Previous Visits</h3>
                  {visitLogs.length === 0 && <p>No previous visits found.</p>}
                  {visitLogs.map((log, index) => (
                    <div key={index} className="visit-entry">
                      <p>
                        <strong>Date:</strong> {log.date}
                      </p>
                      <p>
                        <strong>Time:</strong> {log.time}
                      </p>
                      <p>
                        <strong>Reason:</strong> {log.reason}
                      </p>
                      <p>
                        <strong>Diagnosis:</strong> {log.diagnosis}
                      </p>
                      <p>
                        <strong>Remarks:</strong> {log.remarks}
                      </p>

                      {log.nextAdvisedDate && (
                        <p><strong>Next Advised Date:</strong> {log.nextAdvisedDate}</p>
                      )}

                      <hr />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorAppointments;

