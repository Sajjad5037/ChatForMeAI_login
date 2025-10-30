import { useState, useEffect,useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import PatientList from "./PatientList"; // Import PatientList component



function DashboardPage3({ setIsLoggedIn, doctorData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const server="https://web-production-e5ae.up.railway.app"
  //const server = "http://localhost:3000"

  const queryParams = new URLSearchParams(location.search);
  const publicTokenFromUrl = queryParams.get("publicToken");
  const isPublicMode = !!publicTokenFromUrl;

  const [patients, setPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [newPatientName, setNewPatientName] = useState("");
  const [averageInspectionTime, setAverageInspectionTime] = useState(300);
  const [timers, setTimers] = useState({});
  const [publicToken, setPublicToken] = useState(null);


  // Reference to the WebSocket connection
  const wsRef = useRef(null);
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };


  // Handle logout (only for authenticated mode)
  const handleLogout = async () => {
    
    wsRef.current.send(JSON.stringify({ type: "close_connection" }));
    setIsLoggedIn(false);
             
  };
  const addPatient = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Send the message once WebSocket is open
        wsRef.current.send(JSON.stringify({ type: "add_patient", patient: newPatientName }));
        setNewPatientName(""); // Reset input after sending
    } 
  };

  const ResetAll = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Send the reset message once WebSocket is open
        wsRef.current.send(JSON.stringify({ type: "reset_all" }));
    }
};



  // Add a new patient (only in authenticated mode)
  

  // Mark current patient as done (only in authenticated mode)
  const markAsDone = () => {
    if (isPublicMode || !currentPatient) return;
    wsRef.current.send(JSON.stringify({ type: "mark_done" }));
  };
  
  
  

  // Update countdown timers
  useEffect(() => {
    if (!patients.length) {
      setTimers({});
      return;
    }

    const updatedTimers = {};
    for (let i = 1; i < patients.length; i++) {
      updatedTimers[i] = averageInspectionTime * (i); // Wait time for queued patients
    }

    setTimers(updatedTimers);

    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const newTimers = { ...prevTimers };
        Object.keys(newTimers).forEach((key) => {
          newTimers[key] = Math.max(newTimers[key] - 1, 0);
        });
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [patients, averageInspectionTime]);

  // Fetch publicToken from backend when in authenticated mode
  useEffect(() => {
    if (!isPublicMode) {
      fetch(`${server}/dashboard/public-token`, {
        method: "GET",
        credentials: "include", // Include credentials if you're using authentication
      })
        .then((response) => response.json())
        .then((data) => setPublicToken(data.publicToken))
        .catch((error) => console.error("Error fetching public token:", error));
    }
  }, [isPublicMode]);

// WebSocket setup
useEffect(() => {
  // Prevent creating a new WebSocket if one already exists
  if (wsRef.current) {
    console.log("WebSocket already connected.");
    return;  // Exit early and prevent creating a new WebSocket
  }
   //for online testing
  const wsUrl = isPublicMode
    ? `wss://web-production-e5ae.up.railway.app/ws/public/${publicTokenFromUrl}`
    : "wss://web-production-e5ae.up.railway.app/ws";
  
  // for local testing 
  //const wsUrl = isPublicMode
   // ? `ws://localhost:3000/ws/public/${publicTokenFromUrl}`
   // : "ws://localhost:3000/ws";
  //for local testing */

  console.log("Attempting to connect to WebSocket at:", wsUrl);

  const ws = new WebSocket(wsUrl);
  wsRef.current = ws;

  ws.onopen = () => {
    console.log(`✅ WebSocket connected in ${isPublicMode ? "public" : "authenticated"} mode`);
  };

  ws.onmessage = (event) => { //event is the message received from the server
    console.log("📩 WebSocket message received:", event.data);
    try {
      const message = JSON.parse(event.data);
      if (message.type === "update_state") {
        const { patients, currentPatient, averageInspectionTime } = message.data;
        console.log("Updating state with new data:", message.data);
      
        setPatients(patients || []);
        setCurrentPatient(currentPatient);
        setAverageInspectionTime(averageInspectionTime || 300);
      
        const updatedTimers = {};
        for (let i = 1; i < patients.length; i++) {
          updatedTimers[i] = (averageInspectionTime || 300) * i;
        }
        setTimers(updatedTimers);
      } else if (message.type === "connection_closed") {
        // 🔹 Handle broadcaster disconnection
        console.log("Broadcaster has disconnected, stopping UI updates...");
        alert("The broadcaster has disconnected. Please wait or refresh.");
      
        // 🔹 Clear state or redirect users
        setPatients([]);
        setCurrentPatient(null);
        setTimers({});
        navigate("/");
        setAverageInspectionTime(300);
        alert("The broadcaster has disconnected. Please wait or refresh.");
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  ws.onerror = (error) => {
    console.error("❌ WebSocket error:", error);
  };

  ws.onclose = (event) => {
    console.warn("⚠️ WebSocket closed with code:", event.code, "reason:", event.reason);
  };

  return () => {
    ws.close();
    console.log("WebSocket connection closed intentionally.");
  };
}, []);
// Define shareableUrl using fetched publicToken
const shareableUrl = publicToken
  ? `${window.location.origin}/dashboard?publicToken=${publicToken}`
  : "Fetching URL...";

return (
  <div style={styles.container}>
    {doctorData && !isPublicMode && (
      <>
        <h1 style={styles.title}>Welcome, Dr. {doctorData?.name}</h1>
        <p style={styles.subtext}>Specialization: {doctorData?.specialization}</p>
      </>
    )}
    {isPublicMode && (
      <>
        <h1 style={styles.title}>
          Sarfraz Clinic <br /> Patient Waiting List
        </h1>

        <footer style={styles.footer}>
          <p>Contact Us: +123 456 7890</p>
          <p>Email: contact@sarfrazclinic.com</p>
          <p>Address: 123 Clinic Street, City, Country</p>
        </footer>
      </>
    )}

    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <h3 style={styles.averageTime}>
        Average Inspection Time: {formatTime(averageInspectionTime)} minutes
      </h3>
      
    </div>

      {/* this shows who is currently inspected by the doctor... 
      <ul style={styles.patientList}>
        {patients.map((patient, index) => (
          <li key={index} style={styles.patientItem}>
            {index === 0 ? (
              <strong>{patient} (Being Inspected)</strong>
            ) : (
              <>
                {patient} - <span style={styles.timer}>Wait Time: {formatTime(timers[index] || 0)}</span>
              </>
            )}
          </li>
        ))}
      </ul>
      */}

    <div>
      <h2>Waiting List</h2>
      <ul style={styles.patientList}>
        {patients.map((patient, index) => (
          <li key={index} style={styles.patientItem}>
            {patient} - <span style={styles.timer}>Wait Time: {formatTime(timers[index] || 0)}</span>
          </li>
        ))}
      </ul>
    </div>



    {!isPublicMode && (
      <div>
                
              {/* <h2>Current Patient:</h2>
              {currentPatient ? (
               <p style={styles.currentPatient}>{currentPatient}</p>
              ) : (
              <p style={styles.noPatient}>No patient currently being inspected.</p>
              )} */}

        {!currentPatient && <p style={styles.noPatient}>No patient currently being inspected.</p>}

        {currentPatient && (
          <button onClick={markAsDone} style={{ ...styles.doneButton, marginRight: "10px" }}>
            Done (Next Patient)
          </button>
        )}       

        <input
          type="text"
          value={newPatientName}
          onChange={(e) => setNewPatientName(e.target.value)}
          placeholder="Enter patient's name"
          style={{ ...styles.input, marginRight: "10px" }} // Adds spacing
        />
        <button onClick={addPatient} style={styles.addButton}>
          Add Patient
        </button>
        <button onClick={ResetAll} style={{ ...styles.addButton, marginLeft: "10px" }}>
          Reset All
        </button>
      </div>
    )}

    {!isPublicMode && (
      <div>
        <p>Share this URL with patients:</p>
        <input type="text" value={shareableUrl} readOnly style={styles.shareInput} />
        <button onClick={() => navigator.clipboard.writeText(shareableUrl)} style={styles.copyButton}>
          Copy
        </button>
      </div>
    )}

    {!isPublicMode && (
      <button onClick={handleLogout} style={styles.logoutButton}>
        Logout
      </button>
    )}
  </div>
);
}

// Styles (unchanged)
const styles = {
container: { textAlign: "center", marginTop: "50px", padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f4f4f9", minHeight: "100vh" },
title: { fontSize: "32px", fontWeight: "bold", color: "#2c3e50" },
subtext: { fontSize: "18px", color: "#444" },
averageTime: { fontSize: "20px", fontWeight: "bold", color: "#2980b9", marginTop: "10px" },
patientList: { listStyleType: "none", padding: 0, marginTop: "20px" },
patientItem: { fontSize: "18px", padding: "10px", backgroundColor: "#fff", margin: "5px auto", width: "80%", borderRadius: "5px", boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)" },
timer: { fontSize: "16px", color: "#d35400", fontWeight: "bold" },
logoutButton: { padding: "10px 20px", backgroundColor: "#2c3e50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", margin: "10px" },
shareInput: { width: "50%", padding: "5px", margin: "10px" },
copyButton: { padding: "5px 10px", backgroundColor: "#2980b9", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
};

export default DashboardPage3;