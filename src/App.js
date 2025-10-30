
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate,useParams,useLocation } from "react-router-dom";
import AddDoctor from "./components/AddDoctorPage";
import EditDoctor from "./components/EditDoctorPage";
import DashboardPage from "./components/DashboardPage.js"; 
import AdminPanel from "./components/AdminPage";
import ViewDoctors from "./components/ViewDoctors";
import DeleteDoctor from "./components/DeleteDoctor";
import SignUpPage from "./components/SignUpPage";
import TestTailwind from "./components/TestTailwind"
import './index.css';
import EssayCheckerPDF from "./components/EssayCheckerPDF"
import BusinessChatbot from "./components/BusinessChatbot"

//hello there 


// this function helps me render a component on the dashboardpage based on whether the management is visiting the dashboard or the client is visiting it...
function DashboardWrapper({ setIsLoggedIn, doctorData, isLoggedIn}) {
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search); 
  const publicToken = queryParams.get("publicToken");
  
  // If publicToken exists, render DashboardPage in public mode (no login required)
  if (publicToken) {
    return <DashboardPage setIsLoggedIn={setIsLoggedIn} doctorData={null} />;
  }

  // If no publicToken, require login for authenticated mode
  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }
  
  // Authenticated mode with doctorData
  return (
    <DashboardPage 
      setIsLoggedIn={setIsLoggedIn} 
      doctorData={doctorData} 
       
    />
  );
  
}
function BusinessChatbotWrapper({ setIsLoggedIn, doctorData, isLoggedIn }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const publicToken = queryParams.get("publicToken");
  const sessionToken = queryParams.get("sessionToken");

  if (publicToken) {
    return (
      <BusinessChatbot
        setIsLoggedIn={setIsLoggedIn}
        doctorData={null}
        publicToken={publicToken}
        sessionToken={sessionToken}
      />
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  return (
    <BusinessChatbot
      setIsLoggedIn={setIsLoggedIn}
      doctorData={doctorData}
      publicToken={publicToken}
      sessionToken={sessionToken}
    />
  );
}




function LoginPage({ setIsLoggedIn, setDoctorData ,setSessionToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  

  const navigate = useNavigate(); // Use navigate for redirection
  const server="https://web-production-e5ae.up.railway.app"
  //const server = "http://localhost:3000"
  
  const handleLogin = async () => {
  try {
    // Clear previous state before logging in a new user
    setIsLoggedIn(false);
    setDoctorData(null);

    const response = await fetch(`${server}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Required for sending cookies
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setIsLoggedIn(true);
      setDoctorData(data); // Store doctor data after login
      setSessionToken(data.session_token || null);
      // setPublicToken(data.public_token || null);

      setError(null);

      if (data?.id === 1) {
        navigate("/AdminPanel");
      } else if (data?.specialization === "business_chatbot") {
        navigate("/Chatbot");
      } else {
        navigate("/dashboard"); // Redirect to the default dashboard
      }
    } else {
      setError(data.error || "Invalid credentials");
    }
  } catch (err) {
    setError("Failed to login");
  }
};

  
  const handleSignUp = () => {
    console.log("Sign Up button clicked");
    // Add your sign-up logic here, e.g., navigating to a sign-up page or opening a modal
    navigate("/signup")
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2>Login</h2>
        
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
  
        {/* Buttons placed together below the input fields */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
          <button onClick={handleLogin} style={styles.button}>Login</button>
          <button onClick={handleSignUp} style={styles.button}>Sign Up</button>
        </div>
  
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [doctorData, setDoctorData] = useState(null);
  const [SessionToken, setSessionToken] = useState(null); // Declare sessionToken here
  const [isLoggedInReady, setIsLoggedInReady] = useState(false);  // Flag to check if sessionToken is ready
  const [PublicToken,setPublicToken]=useState(null)

  useEffect(() => {
    document.title = "Class Management System";
  }, []);

  useEffect(() => {
    if (SessionToken) {
      setIsLoggedInReady(true); // Set to true once sessionToken is available
    }
  }, [SessionToken]); // Only run this when SessionToken changes

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LoginPage setIsLoggedIn={setIsLoggedIn} setDoctorData={setDoctorData} setSessionToken={setSessionToken} />}
        />
        <Route
          path="/dashboard"
          element={
            (() => {
              const urlParams = new URLSearchParams(window.location.search);
              const publicToken = urlParams.get("publicToken");
              const SToken = urlParams.get("sessionToken")

              console.log("Extracted Public Token:", publicToken);
              console.log("Extracted Session Token:", SToken);

              if (publicToken) {
                if (!SToken) {
                  console.log("sessionToken is missing, redirecting...");
                  return <Navigate to="/" />;
                }
                return (
                  <DashboardWrapper
                    setIsLoggedIn={setIsLoggedIn}
                    doctorData={doctorData}
                    isLoggedIn={isLoggedIn}
                    sessionToken={SToken}
                    publicToken={publicToken}
                  />
                );
              }

              if (isLoggedIn) {
                if (!SessionToken) {
                  console.log("SessionToken is missing, redirecting...");
                  return <Navigate to="/" />;
                }
                return (
                  <DashboardWrapper
                    setIsLoggedIn={setIsLoggedIn}
                    doctorData={doctorData}
                    isLoggedIn={isLoggedIn}
                    sessionToken={SessionToken}
                  />
                );
              }

              return <Navigate to="/" />;
            })()
          }
        />
        
        <Route
          path="/AdminPanel"
          element={isLoggedIn ? <AdminPanel /> : <Navigate to="/" />}
        /> 

        
        <Route
          path="/chatbot"
          element={
            (() => {
              const urlParams = new URLSearchParams(window.location.search);
              const publicToken = urlParams.get("publicToken");
              const SToken = urlParams.get("sessionToken");

              console.log("Extracted Public Token:", publicToken);
              console.log("Extracted Session Token:", SToken);

              if (publicToken) {
                if (!SToken) {
                  console.log("sessionToken is missing, redirecting...");
                  return <Navigate to="/" />;
                }
                return (
                  <BusinessChatbotWrapper
                    setIsLoggedIn={setIsLoggedIn}
                    doctorData={doctorData}
                    isLoggedIn={isLoggedIn}
                    sessionToken={SToken}
                    publicToken={publicToken}
                  />
                );
              }

              if (isLoggedIn) {
                if (!SessionToken) {
                  console.log("SessionToken is missing, redirecting...");
                  return <Navigate to="/" />;
                }
                return (
                  <BusinessChatbotWrapper
                    setIsLoggedIn={setIsLoggedIn}
                    doctorData={doctorData}
                    isLoggedIn={isLoggedIn}
                    sessionToken={SessionToken} // ✅ Use global SessionToken
                  />
                );
              }

              return <Navigate to="/" />;
            })()
          }
        />


        

        
        
        

        <Route path="/add-doctor" element={<AddDoctor />} />
        <Route path="/edit-doctor" element={<EditDoctor />} />
        <Route path="/view-doctors" element={<ViewDoctors />} />
        <Route path="/delete-doctor" element={<DeleteDoctor />} />
        <Route path="/signup" element={<SignupPage_ShahRukh />} />
      </Routes>
    </Router>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f4f4",
    minHeight: "100vh",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  description: {
    fontSize: "16px",
    color: "#555",
    maxWidth: "600px",
    margin: "0 auto",
    paddingBottom: "20px",
  },
  loginBox: {
    backgroundColor: "#ffffff",
    padding: "20px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    display: "inline-block",
    marginTop: "20px",
  },
  input: {
    padding: "10px",
    margin: "10px",
    width: "80%",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#0078D4",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },
  error: {
    color: "red",
    fontSize: "14px",
  },
  subtext: {
    fontSize: "18px",
    color: "#444",
  },
};

export default App;
