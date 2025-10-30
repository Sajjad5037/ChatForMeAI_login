import React from "react";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Admin Panel</h2>
            <button 
                style={{ margin: "10px", padding: "10px 20px" }} 
                onClick={() => navigate("/add-doctor")}
            >
                Add a Doctor
            </button>
            <button 
                style={{ margin: "10px", padding: "10px 20px" }} 
                onClick={() => navigate("/edit-doctor")}
            >
                Edit a Doctor
            </button>
            <button 
                style={{ margin: "10px", padding: "10px 20px" }} 
                onClick={() => navigate("/view-doctors")}
            >
                View Doctor List
            </button>
            <button 
                style={{ margin: "10px", padding: "10px 20px" }} 
                onClick={() => navigate("/delete-doctor")}
            >
                Delete a Doctor
            </button>
        </div>
    );
};

export default AdminPanel;
