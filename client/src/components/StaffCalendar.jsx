import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import initialEvents from '../data/events.json';
import activityImages from '../data/images.json';
import './StaffCalendar.css';

const StaffCalendar = () => {
    const [events, setEvents] = useState(initialEvents);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        date: '',
        startTime: '09:00',
        endTime: '10:00',
        isWheelchairAccessible: false,
        selectedImage: activityImages[0].url
    });

    const handleDateClick = (arg) => {
        setFormData({ ...formData, date: arg.dateStr });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        const startDateTime = `${formData.date}T${formData.startTime}:00`;
        const endDateTime = `${formData.date}T${formData.endTime}:00`;

        const newEvent = {
            id: String(Date.now()),
            title: formData.title,
            start: startDateTime,
            end: endDateTime,
            extendedProps: {
                isWheelchairAccessible: formData.isWheelchairAccessible,
                imageUrl: formData.selectedImage
            }
        };

        setEvents([...events, newEvent]);
        setIsModalOpen(false);
        setFormData({ title: '', date: '', startTime: '09:00', endTime: '10:00', isWheelchairAccessible: false });
    };

    const renderEventContent = (eventInfo) => {
        const { imageUrl, isWheelchairAccessible } = eventInfo.event.extendedProps;
        return (
            <div className="event-card">
                <img src={imageUrl} alt="event" style={{ width: '30px', borderRadius: '4px' }} />
                <span>{eventInfo.event.title}</span>
                {isWheelchairAccessible && <span> ♿</span>}
            </div>
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Event Management Dashboard</h2>

            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                dateClick={handleDateClick}
                eventContent={renderEventContent}
                height="80vh"
            />

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>New Activity for {formData.date}</h3>

                        <label>Select Activity Icon</label>
                        <div className="image-grid">
                            {activityImages.map((img) => (
                                <div
                                    key={img.label}
                                    className={`image-tile ${formData.selectedImage === img.url ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, selectedImage: img.url })}
                                >
                                    <img src={img.url} alt={img.label} />
                                    <span>{img.label}</span>
                                </div>
                            ))}
                        </div>

                        <label>Program Title</label>
                        <input type="text" value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })} />

                        <div className="time-row">
                            <div>
                                <label>Start Time</label>
                                <input type="time" value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                            </div>
                            <div>
                                <label>End Time</label>
                                <input type="time" value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                            </div>
                        </div>

                        <label className="checkbox-label">
                            <input type="checkbox" checked={formData.isWheelchairAccessible}
                                onChange={(e) => setFormData({ ...formData, isWheelchairAccessible: e.target.checked })} />
                            Wheelchair Accessible
                        </label>

                        <div className="modal-actions">
                            <button className="save-btn" onClick={handleSave}>Save Activity</button>
                            <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffCalendar;