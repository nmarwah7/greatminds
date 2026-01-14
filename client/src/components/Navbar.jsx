import React from 'react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-title">GreatMiNDs</div>
      <div className="navbar-links">
        <span>Programs</span>
        <span>Calendar</span>
        <span>About</span>
        <button className="home-btn">Home</button>
      </div>
    </nav>
  );
}
