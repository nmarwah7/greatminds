import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import activityImages from "../data/images.json";
import participantsData from "../data/participants.json";
import volunteersData from "../data/volunteers.json";
import registrationsData from "../data/registrations.json";
import "./EventDetailsPage.css";

export default function EventDetailsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { event, onUpdate } = location.state || {};

    const [formData, setFormData] = useState({
        title: event?.title || "",
        date: event?.start ? new Date(event.start).toISOString().slice(0, 10) : "",
        startTime: event?.start ? new Date(event.start).toTimeString().slice(0, 5) : "09:00",
        endTime: event?.end ? new Date(event.end).toTimeString().slice(0, 5) : "10:00",
        isWheelchairAccessible: event?.extendedProps?.isWheelchairAccessible || false,
        imageUrl: event?.extendedProps?.imageUrl || activityImages[0].url,
        contactIc: event?.extendedProps?.contactIc || "",
        cost: event?.extendedProps?.cost || "",
        location: event?.extendedProps?.location || "",
        description: event?.extendedProps?.description || ""
    });

    const [participants, setParticipants] = useState([]);
    const [volunteers, setVolunteers] = useState([]);

    useEffect(() => {
        if (event?.id) {
            const eventRegistrations = registrationsData.filter(reg => reg.eventId == event.id);
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
    }, [event?.id]);

    const [confirmationMessage, setConfirmationMessage] = useState("");
    const [attendanceMessage, setAttendanceMessage] = useState("");
    const [confirmationsSent, setConfirmationsSent] = useState(false);

    const handleSave = () => {
        const updatedEvent = {
            ...event,
            title: formData.title,
            start: `${formData.date}T${formData.startTime}:00`,
            end: `${formData.date}T${formData.endTime}:00`,
            extendedProps: {
                ...event.extendedProps,
                isWheelchairAccessible: formData.isWheelchairAccessible,
                imageUrl: formData.imageUrl,
                contactIc: formData.contactIc,
                cost: formData.cost === '' ? null : parseFloat(formData.cost),
                location: formData.location,
                description: formData.description
            }
        };

        if (onUpdate) {
            onUpdate(updatedEvent);
        }

        alert("Event updated successfully!");
        navigate(-1);
    };

    const handleParticipantStatusChange = (id, newStatus) => {
        setParticipants(participants.map(p =>
            p.id === id ? { ...p, status: newStatus } : p
        ));
    };

    const handleVolunteerStatusChange = (id, newStatus) => {
        setVolunteers(volunteers.map(v =>
            v.id === id ? { ...v, status: newStatus } : v
        ));
    };

    const handleParticipantAttendanceChange = (id, attendance) => {
        setParticipants(participants.map(p =>
            p.id === id ? { ...p, attendance } : p
        ));
    };

    const handleVolunteerAttendanceChange = (id, attendance) => {
        setVolunteers(volunteers.map(v =>
            v.id === id ? { ...v, attendance } : v
        ));
    };

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

    const submitAttendance = () => {
        const confirmedParticipants = participants.filter(p => p.status === "confirmed");
        const confirmedVolunteers = volunteers.filter(v => v.status === "confirmed");

        const participantsWithAttendance = confirmedParticipants.filter(p => p.attendance !== null);
        const volunteersWithAttendance = confirmedVolunteers.filter(v => v.attendance !== null);

        const totalConfirmed = confirmedParticipants.length + confirmedVolunteers.length;
        const totalRecorded = participantsWithAttendance.length + volunteersWithAttendance.length;

        setAttendanceMessage(`✅ Attendance submitted! Recorded ${totalRecorded} out of ${totalConfirmed} confirmed attendees.`);

        setTimeout(() => setAttendanceMessage(""), 5000);
    };

    // Get confirmed participants and volunteers for attendance tracking
    const confirmedParticipants = participants.filter(p => p.status === "confirmed");
    const confirmedVolunteers = volunteers.filter(v => v.status === "confirmed");

    return (
        <div className="event-details-page">
            <div className="event-details-container">
                <button
                    onClick={() => navigate(-1)}
                    className="back-button"
                >
                    ← Back to Calendar
                </button>

                <div className="details-card">
                    <h2>Edit Event Details</h2>

                    <div className="form-grid">
                        <div>
                            <label className="form-label">
                                Event Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label className="form-label">
                                Description
                            </label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label className="form-label">
                                Activity Image
                            </label>
                            <select
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                className="form-select"
                            >
                                {activityImages.map((img) => (
                                    <option key={img.id} value={img.url}>
                                        {img.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-grid-col-3">
                            <div>
                                <label className="form-label">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                            <div>
                                <label className="form-label">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                            <div>
                                <label className="form-label">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">
                                Location
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="form-input"
                            />
                        </div>

                        <div className="form-grid-col-2">
                            <div>
                                <label className="form-label">
                                    Contact IC
                                </label>
                                <input
                                    type="text"
                                    value={formData.contactIc}
                                    onChange={(e) => setFormData({ ...formData, contactIc: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                            <div>
                                <label className="form-label">
                                    Cost ($)
                                </label>
                                <input
                                    type="number"
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.isWheelchairAccessible}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        isWheelchairAccessible: e.target.checked
                                    })}
                                />
                                <span>Wheelchair Accessible</span>
                            </label>
                        </div>

                        <button
                            onClick={handleSave}
                            className="save-button"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Participants Section */}
                <div className="details-card">
                    <h2>Participants</h2>
                    <table className="participants-table">
                        <thead>
                            <tr>
                                <th>Participant Name</th>
                                <th>Caregiver Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {participants.map((participant) => (
                                <tr key={participant.id}>
                                    <td>{participant.name}</td>
                                    <td>{participant.caregiverName}</td>
                                    <td>{participant.email}</td>
                                    <td>{participant.phone}</td>
                                    <td>
                                        <select
                                            value={participant.status}
                                            onChange={(e) => handleParticipantStatusChange(
                                                participant.id,
                                                e.target.value
                                            )}
                                            className={`status-select ${participant.status === "confirmed"
                                                ? "status-confirmed"
                                                : participant.status === "waitlisted"
                                                    ? "status-waitlisted"
                                                    : ""
                                                }`}
                                        >
                                            <option value="registered">Registered</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="waitlisted">Waitlisted</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Volunteers Section */}
                <div className="details-card">
                    <h2>Volunteers</h2>
                    <table className="volunteers-table">
                        <thead>
                            <tr>
                                <th>Volunteer Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {volunteers.map((volunteer) => (
                                <tr key={volunteer.id}>
                                    <td>{volunteer.name}</td>
                                    <td>{volunteer.email}</td>
                                    <td>{volunteer.phone}</td>
                                    <td>
                                        <select
                                            value={volunteer.status}
                                            onChange={(e) => handleVolunteerStatusChange(
                                                volunteer.id,
                                                e.target.value
                                            )}
                                            className={`status-select ${volunteer.status === "confirmed"
                                                ? "status-confirmed"
                                                : volunteer.status === "waitlisted"
                                                    ? "status-waitlisted"
                                                    : ""
                                                }`}
                                        >
                                            <option value="registered">Registered</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="waitlisted">Waitlisted</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Send Confirmation Button */}
                <div className="details-card confirmation-section">
                    <button
                        onClick={sendConfirmations}
                        className="send-confirmations-button"
                    >
                        Send Confirmations
                    </button>

                    {confirmationMessage && (
                        <div className={`confirmation-message ${confirmationMessage.includes("✅") ? "success" : "warning"
                            }`}>
                            {confirmationMessage}
                        </div>
                    )}
                </div>

                {/* Attendance Tracking Section - Only shows after confirmations sent */}
                {confirmationsSent && (confirmedParticipants.length > 0 || confirmedVolunteers.length > 0) && (
                    <>
                        <div className="details-card attendance-section">
                            <h2>Track Attendance</h2>
                            <p>
                                Record attendance for confirmed participants and volunteers
                            </p>

                            {/* Participants Attendance */}
                            {confirmedParticipants.length > 0 && (
                                <>
                                    <h3>Participants Attendance</h3>
                                    <table className="attendance-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Attendance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {confirmedParticipants.map((participant) => (
                                                <tr key={participant.id}>
                                                    <td>{participant.name}</td>
                                                    <td>{participant.email}</td>
                                                    <td>
                                                        <select
                                                            value={participant.attendance || ""}
                                                            onChange={(e) => handleParticipantAttendanceChange(
                                                                participant.id,
                                                                e.target.value
                                                            )}
                                                            className={`attendance-select ${participant.attendance === "present"
                                                                ? "attendance-present"
                                                                : participant.attendance === "absent"
                                                                    ? "attendance-absent"
                                                                    : ""
                                                                }`}
                                                        >
                                                            <option value="">Not Recorded</option>
                                                            <option value="present">Present</option>
                                                            <option value="absent">Absent</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}

                            {/* Volunteers Attendance */}
                            {confirmedVolunteers.length > 0 && (
                                <div className="volunteers-attendance">
                                    <h3>Volunteers Attendance</h3>
                                    <table className="attendance-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Attendance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {confirmedVolunteers.map((volunteer) => (
                                                <tr key={volunteer.id}>
                                                    <td>{volunteer.name}</td>
                                                    <td>{volunteer.email}</td>
                                                    <td>
                                                        <select
                                                            value={volunteer.attendance || ""}
                                                            onChange={(e) => handleVolunteerAttendanceChange(
                                                                volunteer.id,
                                                                e.target.value
                                                            )}
                                                            className={`attendance-select ${volunteer.attendance === "present"
                                                                ? "attendance-present"
                                                                : volunteer.attendance === "absent"
                                                                    ? "attendance-absent"
                                                                    : ""
                                                                }`}
                                                        >
                                                            <option value="">Not Recorded</option>
                                                            <option value="present">Present</option>
                                                            <option value="absent">Absent</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <button
                                onClick={submitAttendance}
                                className="submit-attendance-button"
                            >
                                Submit Attendance
                            </button>

                            {attendanceMessage && (
                                <div className="attendance-message">
                                    {attendanceMessage}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}