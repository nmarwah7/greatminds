import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import initialEvents from '../data/events.json';
import activityImages from '../data/images.json';
import './StaffCalendar.css';
import CreateEventModal from './CreateEventModal';

const DAYS = [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
    { label: 'Sun', value: 0 },
];

const StaffCalendar = () => {
    const [events, setEvents] = useState(initialEvents);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        startDate: '',
        startTime: '09:00',
        endTime: '10:00',
        isWheelchairAccessible: false,
        selectedImage: activityImages[0].url,
        selectedDays: [],
        commitment: 1,
        contactIc: '',
        cost: ''
    });

    const handleDateClick = (arg) => {
        const dayValue = new Date(arg.dateStr).getDay();
        setFormData({ ...formData, startDate: arg.dateStr, selectedDays: [dayValue] });
        setIsModalOpen(true);
    };

    const toggleDay = (dayValue) => {
        const current = formData.selectedDays;
        const newDays = current.includes(dayValue)
            ? current.filter(d => d !== dayValue)
            : [...current, dayValue];
        setFormData({ ...formData, selectedDays: newDays });
    }

    const handleSave = () => {
        const isMultiDay = formData.selectedDays.length > 1;
        const costValue = formData.cost === '' ? null : Number.parseFloat(formData.cost);
        const seriesId = isMultiDay ? `series_${Date.now()}` : null;
        const newEventsBatch = [];

        if (!isMultiDay) {
            newEventsBatch.push({
                id: `event_${Math.random().toString(36)}`,
                isSeries: false,
                seriesId: null,
                title: formData.title,
                start: `${formData.startDate}T${formData.startTime}:00`,
                end: `${formData.startDate}T${formData.endTime}:00`,
                extendedProps: {
                    isWheelchairAccessible: formData.isWheelchairAccessible,
                    imageUrl: formData.selectedImage,
                    minCommitment: 1,
                    contactIc: formData.contactIc,
                    cost: Number.isFinite(costValue) ? costValue : null
                }
            });
        } else {
            formData.selectedDays.forEach(dayOffset => {
                const baseDate = new Date(formData.startDate);
                const dayOfWeek = baseDate.getDay();
                const distance = (dayOffset + 7 - dayOfWeek) % 7;
                const eventDate = new Date(baseDate);
                eventDate.setDate(baseDate.getDate() + distance);
                const dateStr = eventDate.toISOString().split('T')[0];

                newEventsBatch.push({
                    id: `event_${Math.random().toString(36)}`,
                    isSeries: true,
                    seriesId: seriesId,
                    title: formData.title,
                    start: `${dateStr}T${formData.startTime}:00`,
                    end: `${dateStr}T${formData.endTime}:00`,
                    extendedProps: {
                        isWheelchairAccessible: formData.isWheelchairAccessible,
                        imageUrl: formData.selectedImage,
                        minCommitment: formData.commitment,
                        contactIc: formData.contactIc,
                        cost: Number.isFinite(costValue) ? costValue : null
                    }
                });
            });
        }

        setEvents([...events, ...newEventsBatch]);
        setIsModalOpen(false);
        setFormData({
            title: '',
            startDate: '',
            startTime: '09:00',
            endTime: '10:00',
            isWheelchairAccessible: false,
            selectedImage: activityImages[0].url,
            selectedDays: [],
            commitment: 1,
            contactIc: '',
            cost: ''
        });
    };

    const renderEventContent = (eventInfo) => {
        const { imageUrl, isWheelchairAccessible } = eventInfo.event.extendedProps;
        return (
            <div className="event-card" title={eventInfo.event.title}>
                <img className="event-thumb" src={imageUrl} alt="event" />
                <div className="event-bottom">
                    <span className="event-title">{eventInfo.event.title}</span>
                    {isWheelchairAccessible && (
                        <span className="badge badge-access" aria-label="Wheelchair accessible">♿</span>
                    )}
                </div>
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
                <CreateEventModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    formData={formData}
                    setFormData={setFormData}
                    DAYS={DAYS}
                    activityImages={activityImages}
                    toggleDay={toggleDay}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default StaffCalendar;