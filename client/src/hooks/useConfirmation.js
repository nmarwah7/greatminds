import { useState } from 'react';

export function useConfirmation(participants, volunteers) {
    const [confirmationMessage, setConfirmationMessage] = useState("");
    const [confirmationsSent, setConfirmationsSent] = useState(false);

    const sendConfirmations = () => {
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
