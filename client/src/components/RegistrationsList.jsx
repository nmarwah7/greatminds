import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useEvents } from '../hooks/useEvents';
import './RegistrationsList.css';

export default function RegistrationsList({ type }) {
    const { events } = useEvents();
    const [userProfiles, setUserProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedUsers, setExpandedUsers] = useState({});

    useEffect(() => {
        fetchRegistrations();
    }, [type]);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const q = query(
                collection(db, 'registrations'),
                where('roleAtRegistration', '==', type.toLowerCase())
            );

            const snapshot = await getDocs(q);
            const regs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Group registrations by user and fetch user details
            const userIds = [...new Set(regs.map(reg => reg.userId))];
            const profiles = [];
            
            await Promise.all(
                userIds.map(async (userId) => {
                    try {
                        const userDoc = await getDoc(doc(db, 'users', userId));
                        const userData = userDoc.exists() ? userDoc.data() : {};
                        
                        const userRegs = regs.filter(reg => reg.userId === userId);
                        
                        const profile = {
                            userId,
                            name: userData.name || userData.email || 'Unknown User',
                            email: userData.email || 'N/A',
                            phone: userData.phone || 'N/A',
                            registrations: userRegs,
                            totalEvents: userRegs.length,
                            confirmedCount: userRegs.filter(r => r.status === 'confirmed').length,
                            registeredCount: userRegs.filter(r => r.status === 'registered').length,
                            waitlistedCount: userRegs.filter(r => r.status === 'waitlisted').length
                        };

                        // Add role-specific fields
                        if (type.toLowerCase() === 'participant') {
                            profile.caregiverName = userData.caregiverName || 'N/A';
                            profile.wheelchairUser = userData.wheelchairUser || false;
                            profile.notes = userData.notes || 'None';
                        } else if (type.toLowerCase() === 'volunteer') {
                            profile.preferences = userData.preferences || 'None';
                            // Handle skills as array or string
                            if (Array.isArray(userData.skills)) {
                                profile.skills = userData.skills.join(', ') || 'None';
                            } else {
                                profile.skills = userData.skills || 'None';
                            }
                        }
                        
                        profiles.push(profile);
                    } catch (error) {
                        console.error('Error fetching user:', error);
                    }
                })
            );

            setUserProfiles(profiles);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEventDetails = (eventId) => {
        return events.find(event => event.id === eventId);
    };

    const toggleUserExpand = (userId) => {
        setExpandedUsers(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    const filteredProfiles = userProfiles.filter(profile => {
        const matchesStatus = filterStatus === 'all' || 
            profile.registrations.some(reg => reg.status === filterStatus);
        const matchesSearch = !searchTerm || 
            profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            profile.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusClass = (status) => {
        const statusMap = {
            registered: 'status-orange',
            confirmed: 'status-green',
            waitlisted: 'status-blue'
        };
        return statusMap[status] || 'status-orange';
    };

    if (loading) return <div className="registrations-loading">Loading registrations...</div>;

    return (
        <div className="registrations-container">
            <div className="registrations-header">
                <h2>{type} Registry ({filteredProfiles.length} {type.toLowerCase()}s)</h2>
                
                <div className="registrations-filters">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Statuses</option>
                        <option value="registered">Registered</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="waitlisted">Waitlisted</option>
                    </select>
                </div>
            </div>

            <div className="user-profiles-list">
                {filteredProfiles.map(profile => (
                    <div key={profile.userId} className="user-profile-card">
                        <div className="profile-header" onClick={() => toggleUserExpand(profile.userId)}>
                            <div className="profile-main">
                                <h3>{profile.name} {profile.wheelchairUser && '♿'}</h3>
                                <div className="profile-stats">
                                    <span className="stat-badge">📅 {profile.totalEvents} Events</span>
                                    {profile.confirmedCount > 0 && (
                                        <span className="stat-badge confirmed">✓ {profile.confirmedCount} Confirmed</span>
                                    )}
                                    {profile.registeredCount > 0 && (
                                        <span className="stat-badge registered">○ {profile.registeredCount} Registered</span>
                                    )}
                                    {profile.waitlistedCount > 0 && (
                                        <span className="stat-badge waitlisted">⏳ {profile.waitlistedCount} Waitlisted</span>
                                    )}
                                </div>
                            </div>
                            <button className="expand-btn">
                                {expandedUsers[profile.userId] ? '▼' : '▶'}
                            </button>
                        </div>

                        {expandedUsers[profile.userId] && (
                            <div className="profile-details">
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <strong>📧 Email:</strong>
                                        <span>{profile.email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>📱 Phone:</strong>
                                        <span>{profile.phone}</span>
                                    </div>
                                    {type.toLowerCase() === 'participant' && (
                                        <>
                                            <div className="detail-item">
                                                <strong>👤 Caregiver Name:</strong>
                                                <span>{profile.caregiverName}</span>
                                            </div>
                                            <div className="detail-item">
                                                <strong>♿ Wheelchair User:</strong>
                                                <span>{profile.wheelchairUser ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div className="detail-item full-width">
                                                <strong>📝 Notes:</strong>
                                                <span>{profile.notes}</span>
                                            </div>
                                        </>
                                    )}
                                    {type.toLowerCase() === 'volunteer' && (
                                        <>
                                            <div className="detail-item full-width">
                                                <strong>⭐ Preferences:</strong>
                                                <span>{profile.preferences}</span>
                                            </div>
                                            <div className="detail-item full-width">
                                                <strong>🛠️ Skills:</strong>
                                                <span>{profile.skills}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="events-list">
                                    <h4>Registered Events:</h4>
                                    <table className="events-table">
                                        <thead>
                                            <tr>
                                                <th>Event</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                                <th>Registered On</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {profile.registrations.map(reg => {
                                                const event = getEventDetails(reg.eventId);
                                                return (
                                                    <tr key={reg.id}>
                                                        <td>{event?.title || 'Unknown Event'}</td>
                                                        <td>{event?.start ? new Date(event.start).toLocaleDateString() : 'N/A'}</td>
                                                        <td>
                                                            <span className={`status-badge ${getStatusClass(reg.status)}`}>
                                                                {reg.status}
                                                            </span>
                                                        </td>
                                                        <td>{reg.timestamp?.toDate().toLocaleDateString() || 'N/A'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {filteredProfiles.length === 0 && (
                    <div className="no-registrations">
                        No {type.toLowerCase()}s found
                    </div>
                )}
            </div>
        </div>
    );
}
