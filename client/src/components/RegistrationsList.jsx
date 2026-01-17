import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useEvents } from '../hooks/useEvents';
import './RegistrationsList.css';

export default function RegistrationsList({ type }) {
    const { events } = useEvents();
    const [registrations, setRegistrations] = useState([]);
    const [userNames, setUserNames] = useState({});
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

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

            // Fetch user names
            const userIds = [...new Set(regs.map(reg => reg.userId))];
            const names = {};
            
            await Promise.all(
                userIds.map(async (userId) => {
                    try {
                        const userDoc = await getDoc(doc(db, 'users', userId));
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            names[userId] = userData.name || userData.email || 'Unknown User';
                        } else {
                            names[userId] = 'Unknown User';
                        }
                    } catch (error) {
                        names[userId] = 'Unknown User';
                    }
                })
            );

            setUserNames(names);
            setRegistrations(regs);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEventDetails = (eventId) => {
        return events.find(event => event.id === eventId);
    };

    const filteredRegistrations = registrations.filter(reg => {
        const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;
        const event = getEventDetails(reg.eventId);
        const matchesSearch = !searchTerm || 
            (event?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
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
                <h2>{type} Registrations ({filteredRegistrations.length})</h2>
                
                <div className="registrations-filters">
                    <input
                        type="text"
                        placeholder="Search by event name..."
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

            <div className="registrations-table">
                <table>
                    <thead>
                        <tr>
                            <th>Event</th>
                            <th>Date</th>
                            <th>User Name</th>
                            <th>Status</th>
                            <th>Registered On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRegistrations.map(reg => {
                            const event = getEventDetails(reg.eventId);
                            return (
                                <tr key={reg.id}>
                                    <td className="event-title">{event?.title || 'Unknown Event'}</td>
                                    <td>{event?.start ? new Date(event.start).toLocaleDateString() : 'N/A'}</td>
                                    <td className="user-name">{userNames[reg.userId] || 'Loading...'}</td>
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

                {filteredRegistrations.length === 0 && (
                    <div className="no-registrations">
                        No registrations found
                    </div>
                )}
            </div>
        </div>
    );
}
