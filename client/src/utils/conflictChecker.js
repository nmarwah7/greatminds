import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs } from "firebase/firestore";

const isOverlapping = (eventA, eventB) => {
    const startA = new Date(eventA.start).getTime();
    const endA = new Date(eventA.end).getTime();
    const startB = new Date(eventB.start).getTime();
    const endB = new Date(eventB.end).getTime();

    return startA < endB && endA > startB;
};

/**
 * Validates a selection against local and global schedules
 * @param {Object} newEvent - The event being selected
 * @param {Array} basket - The current local basket/selection list
 * @param {string} userId - The current user's UID
 * @returns {Promise<{isValid: boolean, message: string}>}
 */
export const validateEventSelection = async (newEvent, basket, userId) => {

    for (const basketItem of basket) {
        if (isOverlapping(newEvent, basketItem)) {
            return {
                isValid: false,
                message: `Schedule Conflict: This overlaps with "${basketItem.title}" already in your selection.`
            };
        }
    }

    try {
        const regQuery = query(
            collection(db, "registrations"), 
            where("userId", "==", userId)
        );
        const regSnapshot = await getDocs(regQuery);
        
        const registeredEventIds = regSnapshot.docs.map(doc => doc.data().eventId);

        if (registeredEventIds.length > 0) {
            const eventsQuery = query(collection(db, "events")); 
            const eventSnapshot = await getDocs(eventsQuery);

            for (const doc of eventSnapshot.docs) {
                if (registeredEventIds.includes(doc.id)) {
                    const existingEvent = {
                        ...doc.data(),
                        start: doc.data().start.toDate(),
                        end: doc.data().end.toDate()
                    };

                    if (isOverlapping(newEvent, existingEvent)) {
                        return {
                            isValid: false,
                            message: `Schedule Conflict: You are already registered for "${existingEvent.title}" at the same time.`
                        };
                    }
                }
            }
        }
    } catch (error) {
        console.error("Global conflict check error:", error);
    }

    return { isValid: true, message: "Success" };
};