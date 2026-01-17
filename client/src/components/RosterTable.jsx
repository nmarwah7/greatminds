import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import "./RosterTable.css";

export function exportToPDF(eventName, participants, volunteers) {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text(`Attendance Sheet: ${eventName}`, 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const participantsTableColumn = [
        "Name", "Role", "Caregiver", "Email", "Phone", "Wheelchair", "Meeting Point", "Notes", "Attended"
    ];

    const participantsTableRows = participants.map((p) => [
        p.name,
        "Participant",
        p.caregiverName || "N/A",
        p.email,
        p.phone,
        p.isWheelchairAccessible ? "Yes" : "No",
        p.meetingPoint || "N/A",
        p.notes || "N/A",
        ""
    ]);

    const volunteersTableColumn = [
        "Name", "Role", "Email", "Phone", "Notes", "Attended"
    ];

    const volunteersTableRows = volunteers.map((v) => [
        v.name,
        "Volunteer",
        v.email,
        v.phone,
        v.notes || "N/A",
        ""
    ]);

    autoTable(doc, {
        startY: 40,
        head: [participantsTableColumn],
        body: participantsTableRows,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] },
    });

    doc.addPage();

    autoTable(doc, {
        startY: 20,
        head: [volunteersTableColumn],
        body: volunteersTableRows,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`Attendance_Sheet_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function RosterTable({ title, people, onStatusChange, isParticipant = false }) {
    return (
        <div className="details-card">
            <h2>{title}</h2>
            <table className="roster-table">
                <thead>
                    <tr>
                        <th>{isParticipant ? "Participant Name" : "Volunteer Name"}</th>
                        {isParticipant && <th>Caregiver Name</th>}
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        {isParticipant && <th>Wheelchair?</th>}
                        {isParticipant && <th>Meeting Point</th>}
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {people.map((person) => (
                        <tr key={person.id}>
                            <td>{person.name}</td>
                            {isParticipant && <td>{person.caregiverName}</td>}
                            <td>{person.email}</td>
                            <td>{person.phone}</td>
                            <td>
                                <select
                                    value={person.status}
                                    onChange={(e) => onStatusChange(
                                        person.id,
                                        e.target.value
                                    )}
                                    className={`status-select ${person.status === "confirmed"
                                        ? "status-confirmed"
                                        : person.status === "waitlisted"
                                            ? "status-waitlisted"
                                            : ""
                                        }`}
                                >
                                    <option value="registered">Registered</option>
                                    <option value="confirmed">Confirmed</option>
                                    {isParticipant && <option value="waitlisted">Waitlisted</option>}
                                </select>
                            </td>
                            {isParticipant && (
                                <td className="icon-cell">
                                    {person.isWheelchairAccessible ? (
                                        <span
                                            className="wc-icon"
                                            title="Wheelchair"
                                            aria-label="Wheelchair"
                                        >
                                            ♿
                                        </span>
                                    ) : (
                                        <span
                                            className="wc-icon wc-none"
                                            title="No wheelchair"
                                            aria-label="No wheelchair"
                                        >
                                            —
                                        </span>
                                    )}
                                </td>
                            )}
                            {isParticipant && (<td>{person.meetingPoint || "N/A"}</td>)}
                            <td className="icon-cell">
                                {person.notes ? (
                                    <span
                                        className="note-icon"
                                        title={person.notes}
                                        aria-label={`Notes: ${person.notes}`}
                                    >
                                        📝
                                    </span>
                                ) : (
                                    "—"
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
