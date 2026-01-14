import activityImages from "../data/images.json";
import "./UpdateEventForm.css";

export default function UpdateEventForm({ formData, setFormData, handleSave }) {
    return (
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
    );
}
