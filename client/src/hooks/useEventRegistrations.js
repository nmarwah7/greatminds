import { useState, useEffect } from 'react';
import participantsData from '../data/participants.json';
import volunteersData from '../data/volunteers.json';
import registrationsData from '../data/registrations.json';

export function useEventRegistrations(eventId) {
    const [participants, setParticipants] = useState([]);
    const [volunteers, setVolunteers] = useState([]);

    useEffect(() => {
        if (eventId) {
            const eventRegistrations = registrationsData.filter(reg => reg.eventId == eventId);

            const participantRegistrations = eventRegistrations.filter(reg => reg.userId.startsWith('user_'));
            const volunteerRegistrations = eventRegistrations.filter(reg => reg.userId.startsWith('vol_'));

            const populatedParticipants = participantRegistrations.map(reg => {
                const participantProfile = participantsData.find(p => p.uid === reg.userId);
                return {
                    ...participantProfile,
                    ...reg
                };
            });

            const populatedVolunteers = volunteerRegistrations.map(reg => {
                const volunteerProfile = volunteersData.find(v => v.uid === reg.userId);
                return {
                    ...volunteerProfile,
                    ...reg
                };
            });

            setParticipants(populatedParticipants);
            setVolunteers(populatedVolunteers);
        }
    }, [eventId]);

    return { participants, setParticipants, volunteers, setVolunteers };
}
