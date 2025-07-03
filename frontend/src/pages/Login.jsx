import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!role || !username || !password) {
      alert('Please fill all fields and select a role.');
      return;
    }

    setLoading(true);

    try {
      // Optional: Check if backend is alive before trying login
      const ping = await fetch('http://localhost:8000/', { method: 'GET' });
      if (!ping.ok) throw new Error("Backend not reachable");
       console.log("Backend is up");

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, username, password })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful. Response:', data);

      if (role === 'doctor') {
        const doctorId = data.doctor_id || data.id;  // adjust this if backend uses different key
        if (!doctorId) {
          alert("Doctor ID not returned from backend.");
          return;
        }
        localStorage.setItem('doctorId', doctorId);
        navigate(`/doctor/${doctorId}/`);
      } else if (role === 'receptionist') {
        localStorage.setItem('receptionistId', data.receptionist_id);
        navigate('/receptionist');
      }

    } catch (err) {
      console.error('Login error:', err);
      alert(`Login error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h3 className="hospital-title">BlueCare Hospital</h3>
        <h2 className="greeting">Welcome Back!</h2>

        <form onSubmit={handleLogin}>
          <label htmlFor="role">Select Role:</label>
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

          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <button
          type="button"
          className="register-btn"
          onClick={() => navigate('/register')}
        >
          New User? Register Here
        </button>
      </div>
    </div>
  );
};

export default Login;
