import React, { useState, useEffect } from "react";
import axios from "axios";

const AddDoctor = () => {
    const [doctor, setDoctor] = useState({
        id: "",
        username: "",
        password: "",
        name: "",
        specialization: "",
    });
    const server="https://web-production-e5ae.up.railway.app"
    //const server = "http://localhost:3000"
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchNextDoctorId = async () => {
            try {
                const response = await axios.get(`${server}/get_next_doctor_id`);
                setDoctor((prev) => ({ ...prev, id: response.data }));
            } catch (error) {
                console.error("Error fetching next doctor ID:", error);
                setMessage("Failed to fetch next doctor ID.");
            }
        };

        fetchNextDoctorId();
    }, []);

    const handleChange = (e) => {
        setDoctor({ ...doctor, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${server}/add_doctor`, doctor);
            setMessage(response.data.message);
            setDoctor({ id: "", username: "", password: "", name: "", specialization: "" });

            const nextIdResponse = await axios.get(`${server}/get_next_doctor_id`);
            setDoctor((prev) => ({ ...prev, id: nextIdResponse.data }));
        } catch (error) {
            setMessage(error.response?.data?.detail || "Failed to add doctor.");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "auto", padding: "20px", textAlign: "center" }}>
            <h2>Add Doctor</h2>

            {message && <p style={{ color: message.includes("Failed") ? "red" : "green" }}>{message}</p>}

            <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
                <input type="number" name="id" placeholder="Doctor ID" value={doctor.id} readOnly required /><br /><br />
                <input type="text" name="username" placeholder="Username" value={doctor.username} onChange={handleChange} required /><br /><br />
                <input type="password" name="password" placeholder="Password" value={doctor.password} onChange={handleChange} required /><br /><br />
                <input type="text" name="name" placeholder="Name" value={doctor.name} onChange={handleChange} required /><br /><br />
                <input type="text" name="specialization" placeholder="Specialization" value={doctor.specialization} onChange={handleChange} required /><br /><br />
                <button type="submit">Add Doctor</button>
            </form>
        </div>
    );
};

export default AddDoctor;
