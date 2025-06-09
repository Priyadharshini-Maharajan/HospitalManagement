import React, { useState } from 'react';
import SidebarReceptionist from '../components/SidebarReceptionist';
import Navbar from '../components/Navbar';
import '../styles/AddPatient.css';

const AddPatient = () => {
  const [form, setForm] = useState({
    name: '',
    dob: '',
    age: '',
    gender: '',
    phone: '',
    emailid: '',
    address: '',
    height: '',
    weight: '',
    bloodPressure: '',
    reason: '',
  });

  const [photo, setPhoto] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!photo) {
      alert("Please upload a photo.");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("dob", form.dob);
    formData.append("age", form.age);
    formData.append("gender", form.gender);
    formData.append("phone_number", form.phone);
    formData.append("email_id", form.emailid);
    formData.append("address", form.address);
    formData.append("admissionheight", form.height);
    formData.append("admissionweight", form.weight);
    formData.append("blood_pressure", form.bloodPressure);
    formData.append("unitvisitnumber", "UV001"); // Replace or fetch dynamically
    formData.append("apacheadmissiondx", form.reason);
    formData.append("picture", photo);

    try {
      const response = await fetch("http://localhost:8000/api/patients", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Patient added successfully!");
        setForm({
          name: '',
          dob: '',
          age: '',
          gender: '',
          phone: '',
          emailid: '',
          address: '',
          height: '',
          weight: '',
          bloodPressure: '',
          reason: '',
        });
        setPhoto(null);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Error submitting patient:", err);
      alert("Submission failed!");
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <SidebarReceptionist />

      <div className="main-content">
        <h2 className="add-patient-title">Add New Patient</h2>
        <form className="add-patient-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="dob"
            placeholder="Date of Birth"
            value={form.dob}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="age"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
            required
          />

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="text"
            name="phone"
            placeholder="Contact Number"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="emailid"
            placeholder="Email-ID"
            value={form.emailid}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="height"
            placeholder="Height (cm)"
            value={form.height}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="weight"
            placeholder="Weight (kg)"
            value={form.weight}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="bloodPressure"
            placeholder="Blood Pressure"
            value={form.bloodPressure}
            onChange={handleChange}
            required
          />

          <textarea
            name="reason"
            placeholder="Reason for Visit"
            value={form.reason}
            onChange={handleChange}
            required
          />

          <label style={{ marginTop: '10px' }}>Upload Patient Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            required
          />

          {photo && (
            <div className="photo-preview" style={{ marginTop: '15px' }}>
              <p>Preview:</p>
              <img
                src={URL.createObjectURL(photo)}
                alt="Preview"
                style={{
                  width: '150px',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
          )}

          <button type="submit" style={{ marginTop: '20px' }}>
            Add Patient
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPatient;
