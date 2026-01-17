import { useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export function useConfirmation(participants, volunteers) {
    const [confirmationMessage, setConfirmationMessage] = useState("");
    const [confirmationsSent, setConfirmationsSent] = useState(false);

    const sendConfirmations = async () => {
        try {
            const updatePromises = [
                ...participants.map(p =>
                    updateDoc(doc(db, 'registrations', p.id), { status: p.status })
                ),
                ...volunteers.map(v =>
                    updateDoc(doc(db, 'registrations', v.id), { status: v.status })
                )
            ];
            await Promise.all(updatePromises);
        } catch (err) {
            setConfirmationMessage(`❌ Failed to save statuses: ${err.message}`);
            return;
        }

        const confirmedParticipants = participants.filter(p =>
            p.status === "confirmed" || p.status === "waitlisted"
        );
        const confirmedVolunteers = volunteers.filter(v =>
            v.status === "confirmed" || v.status === "waitlisted"
        );

        const emails = [
            ...confirmedParticipants.map(p => p.email),
            ...confirmedVolunteers.map(v => v.email)
        ];

        if (emails.length === 0) {
            setConfirmationMessage("No confirmations to send. Please set participants/volunteers to 'Confirmed' or 'Waitlisted' first.");
        } else {
            setConfirmationMessage(`✅ Confirmation and Waitlist emails sent to: ${emails.join(", ")}`);
            setConfirmationsSent(true);
        }

        setTimeout(() => setConfirmationMessage(""), 5000);
    };

    return { confirmationMessage, confirmationsSent, sendConfirmations };
}
