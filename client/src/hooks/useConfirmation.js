import { useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { doc, updateDoc, writeBatch, Timestamp } from 'firebase/firestore';

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

export function useAttendanceConfirmation(participants, volunteers) {
    const [attendanceMessage, setAttendanceMessage] = useState("");

    const sendAttendanceConfirmations = async () => {
        const confirmedParticipants = participants.filter(p => p.status === "confirmed");
        const confirmedVolunteers = volunteers.filter(v => v.status === "confirmed");

        try {
            const batch = writeBatch(db);
            const now = Timestamp.now();

            confirmedParticipants.forEach(p => {
                const ref = doc(db, 'registrations', p.id);
                batch.update(ref, { attendance: p.attendance ?? null, attendanceSubmittedAt: now });
            });
            confirmedVolunteers.forEach(v => {
                const ref = doc(db, 'registrations', v.id);
                batch.update(ref, { attendance: v.attendance ?? null, attendanceSubmittedAt: now });
            });

            await batch.commit();
        } catch (err) {
            setAttendanceMessage(`❌ Failed to save attendance: ${err.message}`);
            return;
        }

        const participantsWithAttendance = confirmedParticipants.filter(p => p.attendance !== null && p.attendance !== undefined);
        const volunteersWithAttendance = confirmedVolunteers.filter(v => v.attendance !== null && v.attendance !== undefined);

        const totalConfirmed = confirmedParticipants.length + confirmedVolunteers.length;
        const totalRecorded = participantsWithAttendance.length + volunteersWithAttendance.length;

        setAttendanceMessage(`✅ Attendance submitted! Recorded ${totalRecorded} out of ${totalConfirmed} confirmed attendees.`);
        setTimeout(() => setAttendanceMessage(""), 5000);
    };

    return { attendanceMessage, sendAttendanceConfirmations };
}
