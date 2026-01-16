import React from 'react';
import './Navbar.css';
import './../index.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-title">GreatMiNDs</div>
            {!loading && (
                <div className="navbar-links">
                    {user ? (
                        <>
                            <button className="programs-btn">Programs</button>
                            <button className="programs-btn" onClick={() => navigate('/dashboard')}>
                                Calendar
                            </button>
                            <button className="programs-btn">About</button>
                            <button className="home-btn">Home</button>
                        </>
                    ) : (
                        <button className="home-btn" onClick={() => navigate('/login')}>Login</button>
                    )}
                </div>
            )}
        </nav>
    );
}
