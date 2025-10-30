import React, { useState } from "react";
import axios from "axios";

const DeleteDoctor = () => {
    const [doctorId, setDoctorId] = useState("");
    const [doctor, setDoctor] = useState(null);
    const [message, setMessage] = useState("");

    const handleSearch = async () => {
        if (!doctorId) {
            setMessage("Please enter a doctor ID.");
            return;
        }
        try {
            const response = await axios.get(`https://web-production-e5ae.up.railway.app/view_doctors/${doctorId}`); 
            if (response.data && response.data.name) {
                setDoctor(response.data);
                setMessage("");
            } else {
                setDoctor(null);
                setMessage("Doctor not found.");
            }
        } catch (error) {
            console.error("Error fetching doctor:", error);
            setDoctor(null);
            setMessage("Failed to fetch doctor.");
        }
    };

    const handleDelete = async () => {
        if (!doctor) {
            setMessage("No doctor selected for deletion.");
            return;
        }
        if (!window.confirm("Are you sure you want to delete this doctor?")) {
            return;
        }
        try {
            await axios.delete(`https://web-production-e5ae.up.railway.app/delete_doctor/${doctorId}`);
            setMessage("Doctor deleted successfully.");
            setDoctorId("");
            setDoctor(null);
        } catch (error) {
            console.error("Error deleting doctor:", error);
            setMessage("Failed to delete doctor.");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "auto", padding: "20px", textAlign: "center" }}>
            <h2>Delete Doctor</h2>
            {message && <p style={{ color: message.includes("Failed") ? "red" : "green" }}>{message}</p>}
            
            <input
                type="number"
                placeholder="Enter Doctor ID"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
                style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
            />
            <br />
            <button 
                style={{ backgroundColor: "blue", color: "white", padding: "10px 15px", border: "none", cursor: "pointer", marginBottom: "10px" }}
                onClick={handleSearch}
            >
                Search Doctor
            </button>

            {doctor && (
                <div style={{ marginTop: "20px", textAlign: "left", padding: "10px", border: "1px solid gray", borderRadius: "5px" }}>
                    <h3>Doctor Details</h3>
                    <p><strong>ID:</strong> {doctor.id}</p>
                    <p><strong>Username:</strong> {doctor.username}</p>
                    <p><strong>Name:</strong> {doctor.name}</p>
                    <p><strong>Specialization:</strong> {doctor.specialization}</p>

                    <button 
                        style={{ backgroundColor: "red", color: "white", padding: "10px 15px", border: "none", cursor: "pointer", marginTop: "10px" }}
                        onClick={handleDelete}
                    >
                        Delete Doctor
                    </button>
                </div>
            )}
        </div>
    );
};

export default DeleteDoctor;
