
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate,useParams,useLocation } from "react-router-dom";
import AddDoctor from "./components/AddDoctorPage";
import EditDoctor from "./components/EditDoctorPage";
import DashboardPage from "./components/DashboardPage.js"; 
import AdminPanel from "./components/AdminPage";
import ChatbotWithPdfTraining2 from "./components/PdfQuery2";
import ViewDoctors from "./components/ViewDoctors";
import DeleteDoctor from "./components/DeleteDoctor";
import SignUpPage from "./components/SignUpPage";
import OrderManager from "./components/OrderManager"
import RealEstate from "./components/RealEstate"
import School from "./components/School"
import ChatbotTrainerUI from "./components/ChatbotTrainerUI"
import ChatbotWithPdfTraining from "./components/PdfQuery"
import EssayChecker from "./components/essay_checker_shahRukh"
import SignupPage_ShahRukh from "./components/signup_ShahRukh"
import EssayDashboard from "./components/EssayDashboard"
import EssayReportsPage from "./components/EssayReportsPage"
import EssayReportsPage_sociology from "./components/EssayReportsPage_sociology"
import ChatbotTrainerUI_sociology from "./components/ChatbotTrainerUI_sociology"
import CreateCampaign from "./components/CreateCampaign"
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


function OrderManagerdWrapper({ setIsLoggedIn, doctorData, isLoggedIn}) {  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search); 
  const publicToken = queryParams.get("publicToken");
  
  // If publicToken exists, render DashboardPage in public mode (no login required)
  if (publicToken) {
    return <OrderManager setIsLoggedIn={setIsLoggedIn} doctorData={null} />;
  }

  // If no publicToken, require login for authenticated mode
  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }
  
  // Authenticated mode with doctorData
  return (
    <OrderManager 
      setIsLoggedIn={setIsLoggedIn} 
      doctorData={doctorData} 
       
    />
  );
  
}

function RealEstateWrapper({ setIsLoggedIn, doctorData, isLoggedIn}) {  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search); 
  const publicToken = queryParams.get("publicToken");
  
  // If publicToken exists, render DashboardPage in public mode (no login required)
  if (publicToken) {
    return <RealEstate setIsLoggedIn={setIsLoggedIn} doctorData={null} />;
  }

  // If no publicToken, require login for authenticated mode
  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }
  
  // Authenticated mode with doctorData
  return (
    <RealEstate 
      setIsLoggedIn={setIsLoggedIn} 
      doctorData={doctorData} 
       
    />
  );
  
}

function SchoolWrapper({ setIsLoggedIn, doctorData, isLoggedIn}) {  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search); 
  const publicToken = queryParams.get("publicToken");
  
  // If publicToken exists, render DashboardPage in public mode (no login required)
  if (publicToken) {
    return <School setIsLoggedIn={setIsLoggedIn} doctorData={null} />;
  }

  // If no publicToken, require login for authenticated mode
  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }
  
  // Authenticated mode with doctorData
  return (
    <School
      setIsLoggedIn={setIsLoggedIn} 
      doctorData={doctorData} 
       
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
        } else if (data?.specialization === "restaurant") {
          navigate("/OrderManager");
        } else if (data?.specialization === "Sociology") {
          navigate("/RealEstate"); // Add the correct navigation path
        }else if (data?.specialization === "CSS_Academy1") {
          navigate("/EssayChecker"); // Add the correct navigation path
        }else if (data?.specialization === "PDF") {
          navigate("/PDF"); // Add the correct navigation path
        }else if (data?.specialization === "sociology") {
          navigate("/Sociology"); // Add the correct navigation path          
        }else if (data?.specialization === "SocialCampaign") {
          navigate("/CreateCampaign"); // Add the correct navigation pathelse if (data?.specialization === "pdf_query") {
          
        }else if (data?.specialization === "bussiness_chatbot") {
          navigate("/Chatbot"); // Add the correct navigation pathelse if (data?.specialization === "pdf_query") {
          
        }else if (data?.specialization === "PDF") {
          navigate("/PDF"); // Add the correct navigation pathelse if (data?.specialization === "pdf_query") {
          
        }else if (data?.specialization === "School") {
          navigate("/School"); // Add the correct navigation path
        }  
        else {
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
      
      {/*
<h1 style={{
  backgroundColor: '#0078D4',
  color: 'white',
  padding: '10px',
  textAlign: 'left', // Align text to the extreme left
  borderRadius: '5px',
  margin: '0', // Ensure no extra space around
  width: '100%', // Make the background span full width
}}>
  Class Management System
</h1>

<p style={styles.description}>
  <br /> {/* Line break at the start *\/}
  Our <strong>AI-Powered Learning Companion</strong> is designed to elevate the quality of education by making exam preparation more interactive and personalized.
  <br /><br />
  <strong>For Students:</strong> The system allows them to upload their own PDFs, notes, and handwritten essays to train a custom language model tailored to their study materials. This enables them to engage in dynamic, back-and-forth conversations with the AI to clarify concepts, test understanding, and receive constructive feedback.
  <br /><br />
  Unlike static resources, this interactive experience mimics a knowledgeable tutor, helping students revise more effectively, build confidence, and focus on their weak areas.
  <br /><br />
  By transforming traditional revision into an intelligent, dialogue-based process, the application promotes deeper understanding, self-directed learning, and better academic outcomes.
</p>
*/}



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
          path="/OrderManager"
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
                  <OrderManagerdWrapper
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
                  <OrderManagerdWrapper
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
          path="/RealEstate"
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
                  <RealEstateWrapper
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
                  <RealEstateWrapper
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
          path="/School"
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
                  <SchoolWrapper
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
                  <SchoolWrapper
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
          path="/OrderManager"
          element={isLoggedIn ? <OrderManager /> : <Navigate to="/" />}
        />
        // App.js snippet
        <Route
          path="/EssayChecker/*"
          element={isLoggedIn ? <EssayDashboard isLoggedIn={isLoggedIn} doctorData={doctorData} /> : <Navigate to="/" />}
        >
          <Route index element={<div>Welcome to the Essay Dashboard. Choose an option from sidebar.</div>} />
          <Route path="evaluator" element={<ChatbotTrainerUI doctorData={doctorData} />} />
          <Route path="reports" element={<EssayReportsPage doctorData={doctorData} />} />
          <Route path="evaluator_pdf" element={<EssayCheckerPDF doctorData={doctorData} />} />
        </Route>
        <Route
          path="/Sociology"
          element={isLoggedIn ? <BusinessChatbot doctorData={doctorData} /> : <Navigate to="/" />}
        />
        <Route
          path="/CreateCampaign"
          element={isLoggedIn ? <CreateCampaign doctorData={doctorData} /> : <Navigate to="/" />}
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


        {/*
        <Route
          path="/EssayChecker"
          element={
            isLoggedIn ? <ChatbotTrainerUI doctorData={doctorData} /> : <Navigate to="/" />
          }
          
        />
        */}

        
        <Route
          path="/EssayCheckerShahRukh"
          element={
            isLoggedIn ? <EssayChecker doctorData={doctorData} /> : <Navigate to="/" />
          }
        />
         <Route
          path="/PdfQuery"
          element={
            isLoggedIn ? <ChatbotWithPdfTraining doctorData={doctorData} /> : <Navigate to="/" />
          }
        />
        <Route
          path="/PDF"
          element={
            isLoggedIn ? <ChatbotWithPdfTraining2 doctorData={doctorData} /> : <Navigate to="/" />
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
