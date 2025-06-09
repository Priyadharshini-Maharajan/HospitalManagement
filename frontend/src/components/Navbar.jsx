import React from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ FIXED
import '../styles/Navbar.css';

const Navbar = ({ hospitalName = 'Blue Hospital', onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    if (onLogout) onLogout(); // Optional: call logout cleanup
    navigate('/login');       // ✅ Navigates to /login
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">{hospitalName}</div>
      <div>
        <button className="logout-btn" onClick={handleLogoutClick}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
