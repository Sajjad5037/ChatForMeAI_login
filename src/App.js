import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import AddDoctor from "./components/AddDoctorPage";
import EditDoctor from "./components/EditDoctorPage";
import DashboardPage from "./components/DashboardPage";
import AdminPanel from "./components/AdminPage";
import ViewDoctors from "./components/ViewDoctors";
import DeleteDoctor from "./components/DeleteDoctor";
import SignUpPage from "./components/SignUpPage";
import TestTailwind from "./components/TestTailwind";
import EssayCheckerPDF from "./components/EssayCheckerPDF";
import BusinessChatbot from "./components/BusinessChatbot";
import WhatsappChatbot from "./components/WhatsappChatbot";

import "./App.css"; // New CSS file

// Dashboard wrapper to handle publicToken or login
function DashboardWrapper({ setIsLoggedIn, doctorData, isLoggedIn }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const publicToken = queryParams.get("publicToken");

  if (publicToken) return <DashboardPage setIsLoggedIn={setIsLoggedIn} doctorData={null} />;
  if (!isLoggedIn) return <Navigate to="/" />;
  return <DashboardPage setIsLoggedIn={setIsLoggedIn} doctorData={doctorData} />;
}

// BusinessChatbot wrapper
function BusinessChatbotWrapper({ setIsLoggedIn, doctorData, isLoggedIn }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const publicToken = queryParams.get("publicToken");
  const sessionToken = queryParams.get("sessionToken");

  console.log("🚦 BusinessChatbotWrapper render");
  console.log("doctorData:", doctorData);
  console.log("isLoggedIn:", isLoggedIn);
  console.log("publicToken:", publicToken);
  console.log("sessionToken:", sessionToken);

  if (publicToken) {
    return (
      <BusinessChatbot
        setIsLoggedIn={setIsLoggedIn}
        doctorData={doctorData} // use actual doctorData
        publicToken={publicToken}
        sessionToken={sessionToken}
      />
    );
  }

  if (!isLoggedIn) {
    console.log("User is not logged in, redirecting to /");
    return <Navigate to="/" />;
  }

  console.log("Rendering BusinessChatbot in private mode with doctorData");
  return (
    <BusinessChatbot
      setIsLoggedIn={setIsLoggedIn}
      doctorData={doctorData}
      publicToken={publicToken}
      sessionToken={sessionToken}
    />
  );
}

function WhatsappChatbotWrapper({ setIsLoggedIn, doctorData, isLoggedIn }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const publicToken = queryParams.get("publicToken");
  const sessionToken = queryParams.get("sessionToken");

  console.log("🚦 WhatsappChatbotWrapper render");
  console.log("doctorData:", doctorData);
  console.log("isLoggedIn:", isLoggedIn);
  console.log("publicToken:", publicToken);
  console.log("sessionToken:", sessionToken);

  if (publicToken) {
    return (
      <WhatsappChatbot
        setIsLoggedIn={setIsLoggedIn}
        doctorData={doctorData} // use actual doctorData
        publicToken={publicToken}
        sessionToken={sessionToken}
      />
    );
  }

  if (!isLoggedIn) {
    console.log("User is not logged in, redirecting to /");
    return <Navigate to="/" />;
  }

  console.log("Rendering WhatsappChatbotWrapper in private mode with doctorData");
  return (
    <WhatsappChatbot
      setIsLoggedIn={setIsLoggedIn}
      doctorData={doctorData}
      publicToken={publicToken}
      sessionToken={sessionToken}
    />
  );
}

// Login Page
function LoginPage({ setIsLoggedIn, setDoctorData, setSessionToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const server = "https://web-production-e5ae.up.railway.app";

  const handleLogin = async () => {
  try {
    console.log("Login attempt started for username:", username);

    setIsLoggedIn(false);
    setDoctorData(null);

    const response = await fetch(`${server}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    console.log("Received response from server:", response);

    const data = await response.json();
    console.log("Parsed JSON data:", data);

    if (response.ok) {
      console.log("Login successful for user ID:", data?.id);

      setIsLoggedIn(true);
      setDoctorData(data);
      setSessionToken(data.session_token || null);
      setError(null);

      if (data?.id === 1) {
        console.log("Navigating to AdminPanel");
        navigate("/AdminPanel");
      } else if (data?.specialization === "bussiness_chatbot") {
        console.log("Navigating to Chatbot");
        navigate("/Chatbot");
      }else if (data?.specialization === "whatsapp_chatbot") {
        console.log("Navigating to Chatbot");
        navigate("/Chatbot-whatsapp");
      }else {
        console.log("Navigating to default dashboard");
        navigate("/dashboard");
      }
    } else {
      console.error("Login failed:", data.error || "Invalid credentials");
      setError(data.error || "Invalid credentials");
    }
  } catch (err) {
    console.error("Error during login:", err);
    setError("Failed to login");
  }
};


  const handleSignUp = () => navigate("/signup");

  return (
    <div className="container">
      <div className="loginBox">
        <h2>Login</h2>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="input" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
        <div className="buttonGroup">
          <button onClick={handleLogin} className="button">Login</button>
          
        </div>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

// Main App
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [doctorData, setDoctorData] = useState(null);
  const [SessionToken, setSessionToken] = useState(null);

  useEffect(() => {
    document.title = "Class Management System";
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage setIsLoggedIn={setIsLoggedIn} setDoctorData={setDoctorData} setSessionToken={setSessionToken} />} />
        <Route path="/dashboard" element={<DashboardWrapper setIsLoggedIn={setIsLoggedIn} doctorData={doctorData} isLoggedIn={isLoggedIn} />} />
        <Route path="/AdminPanel" element={isLoggedIn ? <AdminPanel /> : <Navigate to="/" />} />
        <Route path="/chatbot" element={<BusinessChatbotWrapper setIsLoggedIn={setIsLoggedIn} doctorData={doctorData} isLoggedIn={isLoggedIn} />} />
        <Route path="/Chatbot-whatsapp" element={<WhatsappChatbotWrapper setIsLoggedIn={setIsLoggedIn} doctorData={doctorData} isLoggedIn={isLoggedIn} />} />
        <Route path="/add-doctor" element={<AddDoctor />} />
        <Route path="/edit-doctor" element={<EditDoctor />} />
        <Route path="/view-doctors" element={<ViewDoctors />} />
        <Route path="/delete-doctor" element={<DeleteDoctor />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </Router>
  );
}

export default App;
