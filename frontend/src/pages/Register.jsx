import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css'; // reuse login styles

const Register = () => {
  const [role, setRole] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!role || !id || !password || !confirmPassword) {
      alert('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, id, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed.');
      }

      alert('Registration successful. Please login.');
      navigate('/');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h3 className="hospital-title">Register</h3>
        <form onSubmit={handleRegister}>
          <label htmlFor="role">Register As:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">-- Select --</option>
            <option value="doctor">Doctor</option>
            <option value="receptionist">Receptionist</option>
          </select>

          <label htmlFor="id">{role === 'doctor' ? 'Doctor ID' : role ===''? 'ID' :'Receptionist ID'}:</label>
          <input
            type="text"
            id="id"
            placeholder={`Enter ${role === 'doctor' ? 'Doctor ID' : role ===''? 'ID' : 'Receptionist ID'}`}
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />

          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-btn">Register</button>
          <button
            type="button"
            className="register-btn"
            onClick={() => navigate('/')}
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
