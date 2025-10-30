import React, { useState, useEffect } from "react";
import axios from "axios";

const ViewDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axios.get("https://web-production-e5ae.up.railway.app/view_doctors");
                setDoctors(response.data.doctors);
            } catch (error) {
                console.error("Error fetching doctors:", error);
                setMessage("Failed to fetch doctors.");
            }
        };

        fetchDoctors();
    }, []);

    return (
        <div style={{ maxWidth: "600px", margin: "auto", padding: "20px", textAlign: "center" }}>
            <h2>Doctor List</h2>
            {message && <p style={{ color: "red" }}>{message}</p>}
            {doctors.length > 0 ? (
                <table border="1" style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Name</th>
                            <th>Specialization</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.map((doctor) => (
                            <tr key={doctor.id}>
                                <td>{doctor.id}</td>
                                <td>{doctor.username}</td>
                                <td>{doctor.name}</td>
                                <td>{doctor.specialization}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No doctors available.</p>
            )}
        </div>
    );
};

export default ViewDoctors;
