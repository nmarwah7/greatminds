import { useState, useEffect } from 'react';

import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, query, where, doc, getDoc } from "firebase/firestore";

export function useEventRegistrations(eventId) {
    const [participants, setParticipants] = useState([]);
    const [volunteers, setVolunteers] = useState([]);

    useEffect(() => {
        if (!eventId) return;

        const regQuery = query(
            collection(db, "registrations"), 
            where("eventId", "==", eventId)
        );

        const unsubscribe = onSnapshot(regQuery, async (snapshot) => {
            const participantList = [];
            const volunteerList = [];

            const promises = snapshot.docs.map(async (regDoc) => {
                const regData = regDoc.data();
                
                const userRef = doc(db, "users", regData.userId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const combinedData = { 
                        id: regDoc.id,
                        ...userData,
                        ...regData
                    };

                    if (userData.role === 'participant') {
                        participantList.push(combinedData);
                    } else if (userData.role === 'volunteer') {
                        volunteerList.push(combinedData);
                    }
                }
            });

            await Promise.all(promises);

            setParticipants(participantList);
            setVolunteers(volunteerList);
        });
    }, [eventId]);

    return { participants, setParticipants, volunteers, setVolunteers };
}
