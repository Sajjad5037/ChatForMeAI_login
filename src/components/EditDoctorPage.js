import axios from "axios";
import { useState } from "react";

const EditDoctor = () => {
    const [doctorId, setDoctorId] = useState("");
    const [doctorData, setDoctorData] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Fetch Doctor Details
    const fetchDoctor = async () => {
        try {
            const response = await axios.get(`https://web-production-e5ae.up.railway.app/doctors/${doctorId}`);
            setDoctorData(response.data);
            setError("");
        } catch (err) {
            setDoctorData(null);
            setError("Doctor not found");
        }
    };

    // Handle Input Changes
    const handleChange = (e) => {
        setDoctorData({ ...doctorData, [e.target.name]: e.target.value });
    };

    // Update Doctor Details
    const updateDoctor = async () => {
        if (!doctorData) return;

        try {
            const response = await axios.put(`https://web-production-e5ae.up.railway.app/edit_doctor/${doctorId}`, doctorData);
            setMessage(response.data.message);
            setError("");
            setDoctorId("")
            setDoctorData(null);  // If clearing data

        } catch (err) {
            setMessage("");
            setError("Failed to update doctor");
        }
    };

    return (
        <div>
            <h2>Edit Doctor</h2>

            {/* Search by ID */}
            <input 
                type="number"
                placeholder="Enter Doctor ID"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
            />
            <button onClick={fetchDoctor}>Search</button>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {message && <p style={{ color: "green" }}>{message}</p>}

            {/* Edit Form */}
            {doctorData && (
                <div>
                    <h3>Doctor Details</h3>
                    <label>ID: <b>{doctorData.id}</b></label> <br /><br />
                    
                    <label>Name:</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={doctorData.name} 
                        onChange={handleChange} 
                    /><br /><br />

                    <label>Specialization:</label>
                    <input 
                        type="text" 
                        name="specialization" 
                        value={doctorData.specialization} 
                        onChange={handleChange} 
                    /><br /><br />

                    <label>Username:</label>
                    <input 
                        type="text" 
                        name="username" 
                        value={doctorData.username} 
                        onChange={handleChange} 
                    /><br /><br />

                    <label>Password:</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={doctorData.password} 
                        onChange={handleChange} 
                    /><br /><br />

                    <button onClick={updateDoctor}>Edit Doctor</button>
                </div>
            )}
        </div>
    );
};

export default EditDoctor;
