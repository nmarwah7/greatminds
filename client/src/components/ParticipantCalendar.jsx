import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import initialEvents from '../data/events.json';
import './ParticipantCalendar.css';
import CalendarEventCard from './CalendarEventCard';
import RegistrationModal from './RegistrationModal';

const ParticipantCalendar = () => {
    const [events, setEvents] = useState(initialEvents);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const [selectedSeries, setSelectedSeries] = useState([]);
    const [isRegModalOpen, setIsRegModalOpen] = useState(false);
    const [activeEvent, setActiveEvent] = useState(null);

    // Helper function to flatten event data into a simple shape
    const flattenEvent = (event) => {
        if (!event) return null;
        const ext = event.extendedProps || {};
        return {
            ...ext,
            id: event.id,
            title: event.title,
            start: event.start ? new Date(event.start) : null,
            end: event.end ? new Date(event.end) : null,
        };
    };

    const handleEventClick = (info) => {
        const clickedEvent = info.event;
        setSelectedEvent(flattenEvent(clickedEvent));
        setIsDetailModalOpen(true);
    };

    const renderEventContent = (eventInfo) => {
        const { imageUrl, isWheelchairAccessible } = eventInfo.event.extendedProps;
        return (
            <CalendarEventCard
                title={eventInfo.event.title}
                imageUrl={imageUrl}
                isWheelchairAccessible={isWheelchairAccessible}
            />
        );
    };

    return (
        <div className="participant-container">
            <header className="participant-header">
                <h1>Available Activities</h1>
                <p>Click on a picture to sign up!</p>
            </header>

            <header className="participant-selected-info">
                <h1>Selected Events: {selectedSeries.length}</h1>
            </header>

            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                height="80vh"
                selectable={false}
            />

            {isDetailModalOpen && (
                <div className="modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
                    <div className="modal-content detail-view" onClick={(e) => e.stopPropagation()}>

                        {/* Large visual header for accessibility */}
                        <div className="modal-image-container">
                            <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="modal-hero-img" />
                            {selectedEvent.isWheelchairAccessible && (
                                <div className="accessibility-badge">♿ Wheelchair Accessible</div>
                            )}
                        </div>

                        <div className="modal-body">
                            <h1>{selectedEvent.title}</h1>
                            <p><strong>ℹ️ Description:</strong> {selectedEvent.description || 'No description available.'}</p>

                            <div className="info-section">
                                <p><strong>📅 Date:</strong> {selectedEvent?.start ? selectedEvent.start.toLocaleDateString() : 'TBA'}</p>
                                <p><strong>⏰ Time:</strong> {selectedEvent?.start && selectedEvent?.end
                                    ? `${selectedEvent.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${selectedEvent.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                    : 'All day'}</p>
                                <p><strong>📍 Location:</strong> {selectedEvent.location || 'TBA'}</p>
                                <p><strong>📞 Contact IC:</strong> {selectedEvent.contactIC || 'N/A'}</p>
                                <p><strong>💲 Cost:</strong> {selectedEvent.cost ? `$${selectedEvent.cost.toFixed(2)}` : 'Free'}</p>
                            </div>

                            {selectedEvent.isSeries && (
                                <div className="series-note">
                                    This activity is part of a weekly program.
                                    Select <strong>{selectedEvent.minDaysRequired} days</strong> to register.
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button className="select-btn" onClick={() => alert("Moving to selection logic...")}>
                                Select Activity
                            </button>
                            <button className="cancel-btn" onClick={() => setIsDetailModalOpen(false)}>
                                Back to Calendar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isRegModalOpen && (
                <RegistrationModal
                    event={activeEvent}
                    seriesDays={selectedSeries}
                    onClose={() => setIsRegModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ParticipantCalendar;