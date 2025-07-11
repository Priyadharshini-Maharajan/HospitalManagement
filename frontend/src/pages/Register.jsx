import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Register = () => {
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [dept, setDept] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!role || !name || !password || (role === 'doctor' && (!id || !dept))) {
      alert('All fields are required.');
      return;
    }

    const payload =
      role === 'doctor'
        ? { role, name, id, dept, password }
        : { role, name, password };

    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
            onChange={(e) => {
              setRole(e.target.value);
              setName('');
              setId('');
              setDept('');
              setPassword('');
            }}
            required
          >
            <option value="">-- Select --</option>
            <option value="doctor">Doctor</option>
            <option value="receptionist">Receptionist</option>
          </select>

          {role && (
            <>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              {role === 'doctor' && (
                <>
                  <label htmlFor="id">Doctor ID:</label>
                  <input
                    type="text"
                    id="id"
                    placeholder="Enter Doctor ID"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    required
                  />

                  <label htmlFor="dept">Department:</label>
                  <input
                    type="text"
                    id="dept"
                    placeholder="Enter department"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    required
                  />
                </>
              )}

              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          )}

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
