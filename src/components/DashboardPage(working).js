import { useState, useEffect,useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import PatientList from "./PatientList"; // Import PatientList component
import "./DashboardPage.css";




function DashboardPage({ setIsLoggedIn, doctorData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const server="https://web-production-e5ae.up.railway.app"
  //const server = "http://localhost:3000"
  const sessionToken = doctorData?.session_token
  const queryParams = new URLSearchParams(location.search);
  const publicTokenFromUrl = queryParams.get("publicToken");
  const isPublicMode = !!publicTokenFromUrl;

  console.log("publicTokenFromUrl:", publicTokenFromUrl);
  console.log("isPublicMode:", isPublicMode);


  const [doctorId, setDoctorId] = useState("");

  const [patients, setPatients] = useState([]);
  
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [currentPatient, setCurrentPatient] = useState(null);
  const [newPatientName, setNewPatientName] = useState("");
  const [DoctorName,setDoctorName]=useState("");
  const [averageInspectionTime, setAverageInspectionTime] = useState(300);
  const [timers, setTimers] = useState({});
  const [publicToken, setPublicToken] = useState(null);
  //const [Sessiontoken,setSessiontoken]=useState(null)
  const [notices, setNotices] = useState([]); // Define notices state
  const [newNotice, setNewNotice] = useState(""); // Define newNotice state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  const fetchQRCode = async () => {
    if (!shareableUrl || shareableUrl === "Fetching URL...") {
      console.error("Shareable URL is not available.");
      return;
    }
  
    try {
      // Extract publicToken and sessionToken from shareableUrl
      const url = new URL(shareableUrl);
      const publicToken = url.searchParams.get("publicToken");
      const sessionToken = url.searchParams.get("sessionToken");
  
      if (!publicToken || !sessionToken) {
        console.error("Missing tokens in shareable URL.");
        return;
      }
  
      // Construct the QR code API URL
      const qrCodeUrl = `https://web-production-e5ae.up.railway.app/generate-qr/${publicToken}/${sessionToken}`;
  
      // Fetch the QR code from the backend
      const response = await fetch(qrCodeUrl);
  
      if (!response.ok) {
        throw new Error("Failed to fetch QR code");
      }
  
      const blob = await response.blob();
      const qrCodeImageUrl = URL.createObjectURL(blob);
      setQrCodeUrl(qrCodeImageUrl); // Assuming you have a state to store the QR code image
    } catch (error) {
      console.error("Error fetching QR code:", error);
    }
  };
    const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    try {
        const response = await fetch("https://web-production-e5ae.up.railway.app/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: input, user_id: doctorId }),
        });

        const data = await response.json();
        const botMessage = { text: data.reply, sender: "bot" };

        setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
        console.error("Error fetching chatbot response:", error);
    }
  };// Function to add a new notice
  
  

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
    
    wsRef.current.send(JSON.stringify({ type: "close_connection",session_token: sessionToken }));
    setIsLoggedIn(false);
    
             
  };
  const addPatient = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Send the message once WebSocket is open
        wsRef.current.send(JSON.stringify({ type: "add_patient", patient: newPatientName, session_token: sessionToken }));
        setNewPatientName(""); // Reset input after sending
    } 
  };
  const getSessionTokenFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("sessionToken"); // Extract sessionToken
  };

  

  const ResetAll = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Send the reset message once WebSocket is open
        wsRef.current.send(JSON.stringify({ type: "reset_all",session_token: sessionToken }));
    }
  };
  const addNotice = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Send the notice once WebSocket is open
        wsRef.current.send(JSON.stringify({ 
            type: "add_notice", 
            notice: newNotice, 
            session_token: sessionToken 
        }));
        setNewNotice(""); // Reset input after sending
    }
  };
  const removeNotice = (index) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
            type: "remove_notice",
            index: index, // Pass the index of the notice to remove
            session_token: sessionToken
        }));
    }
  };



  // Add a new patient (only in authenticated mode)
  

  // Mark current patient as done (only in authenticated mode)
  const markAsDone = () => {
    if (isPublicMode || !currentPatient) return;
    wsRef.current.send(JSON.stringify({ type: "mark_done" ,session_token: sessionToken  }));
  };
  
  useEffect(() => {
    const fetchDoctorData = async () => {
      const session_Token = getSessionTokenFromURL();
      if (!session_Token) {
        console.error("Session token not found in URL");
        return;
      }
  
      try {
        // First, get the doctor ID
        const idResponse = await fetch(`https://web-production-e5ae.up.railway.app/get-doctor-id/${session_Token}`);
        const idData = await idResponse.json();
  
        if (idData.doctor_id) {
          setDoctorId(idData.doctor_id);
  
          // Now, fetch the doctor name using the retrieved doctor ID
          const nameResponse = await fetch(`https://web-production-e5ae.up.railway.app/get-doctor-name/${idData.doctor_id}`);
          const nameData = await nameResponse.json();
  
          if (nameData.doctor_name) {
            setDoctorName(nameData.doctor_name);
          } else {
            console.error("Error fetching doctor name:", nameData.detail);
          }
        } else {
          console.error("Error fetching doctor ID:", idData.error);
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    };
  
    fetchDoctorData();
  }, []); // Runs only once when the component mounts


  useEffect(() => {
    if (publicToken && sessionToken) {
      const shareableUrl = `${window.location.origin}/dashboard?publicToken=${publicToken}&sessionToken=${sessionToken}`;
      
  
      fetchQRCode(shareableUrl); // Call fetchQRCode after it's set
    }
  }, [publicToken, sessionToken]); // Runs when tokens are ready
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
      //const sessionToken = localStorage.getItem("sessionToken"); // Retrieve from storage
      console.log("Session Token:", sessionToken);  // Debugging line ✅
  
      if (!sessionToken) {
        console.error("No session token found.");
        return;
      }
  
      fetch(`${server}/dashboard/public-token?session_token=${sessionToken}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Public Token Response:", data.publicToken); // Debugging line ✅
          if (data.error) {
            console.error("Error fetching public token:", data.error);
          } else {
            setPublicToken(data.publicToken);
            //setSessiontoken(data.sessionToken)
          }
        })
        .catch((error) => console.error("Error fetching public token:", error));
    }
  }, [isPublicMode]);
  useEffect(() => {
    // Prevent creating a new WebSocket if one already exists
    if (wsRef.current) {
      console.log("WebSocket already connected.");
      return;
    }
  
    // Debugging: Log URL parameters
    console.log("window.location.search:", window.location.search);
  
    // Extract sessionToken from URL only if in public mode
    const searchParams = new URLSearchParams(window.location.search);
    const extractedSessionToken = searchParams.get("sessionToken") || "";
  
    console.log("Extracted sessionToken from URL:", extractedSessionToken);
    console.log("Existing sessionToken:", sessionToken);
    console.log("isPublicMode:  ", isPublicMode);
  
    // Use sessionToken based on public mode
    const resolvedSessionToken = isPublicMode ? extractedSessionToken : sessionToken;
  
    console.log("Final resolvedSessionToken:", resolvedSessionToken);
  
    // Ensure resolvedSessionToken is valid before proceeding
    if (!resolvedSessionToken) {
      console.warn("⚠️ No valid sessionToken found. WebSocket will not connect.");
      return;
    }
  
    // Extract publicToken if needed
    const publicTokenFromUrl = searchParams.get("publicToken") || "";
  
    // Determine WebSocket URL based on the mode
    /*const wsUrl = isPublicMode
      ? `wss://web-production-e5ae.up.railway.app/ws/public/${resolvedSessionToken}/${publicTokenFromUrl}`
      : `wss://web-production-e5ae.up.railway.app/ws/${resolvedSessionToken}`;
*/
      const wsUrl=`wss://web-production-e5ae.up.railway.app/ws/${resolvedSessionToken}`;

  
    console.log("Attempting to connect to WebSocket at:", wsUrl);
  
    // Create the WebSocket connection
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
  
    // Handle WebSocket open event
    ws.onopen = () => {
      console.log(`✅ WebSocket connected in ${isPublicMode ? "public" : "authenticated"} mode`);
    };
  
    // Handle WebSocket messages
    ws.onmessage = (event) => {
      console.log("📩 WebSocket message received:", event.data);
      try {
          const message = JSON.parse(event.data); // Parse incoming WebSocket message
  
          // ✅ If the message contains only `doctor_id`, update doctor ID and exit
          if (Object.keys(message).length === 1 && "doctor_id" in message) {
              console.log("Received doctor_id:", message.doctor_id);
              setDoctorId(message.doctor_id);
              return; // Exit early, skipping other checks
          }
  
          // ✅ Extracting data fields safely
          const { type, data } = message;
  
          // ✅ Ensure the session token matches
          if (data?.session_token && data.session_token !== resolvedSessionToken) {
              console.log("Session token mismatch. Ignoring message.");
              return;
          }
  
          // ✅ Handling different message types
          if (type === "update_state") {
              console.log("Updating state with new data:", data);
              setPatients(data.patients || []);
              setCurrentPatient(data.currentPatient);
              setAverageInspectionTime(data.averageInspectionTime || 300);
  
              // Initialize timers
              const updatedTimers = {};
              for (let i = 1; i < data.patients.length; i++) {
                  updatedTimers[i] = (data.averageInspectionTime || 300) * i;
              }
              setTimers(updatedTimers);
          } else if (type === "update_notices") {
              console.log("Updating notices:", data.notices);
              setNotices(data.notices || []);
          }  else if (type === "connection_closed") {
              console.log("Broadcaster has disconnected, stopping UI updates...");
              alert("The broadcaster has disconnected. Please wait or refresh.");
  
              // Clear state or redirect users
              setPatients([]);
              setCurrentPatient(null);
              setTimers({});
              setAverageInspectionTime(300);
              navigate("/"); // Navigate to another page or reset state
          }
      } catch (error) {
          console.error("Error parsing WebSocket message:", error);
      }
  };
    // Handle WebSocket errors
    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };
  
    // Handle WebSocket close event
    ws.onclose = (event) => {
      console.warn("⚠️ WebSocket closed with code:", event.code, "reason:", event.reason);
    };
  
    // Cleanup on component unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        console.log("WebSocket connection closed intentionally.");
      }
    };
  }, [sessionToken, isPublicMode, navigate, window.location.search]); // Dependencies
  
  
// Define shareableUrl using fetched publicToken
const shareableUrl = publicToken && sessionToken
  ? `${window.location.origin}/dashboard?publicToken=${publicToken}&sessionToken=${sessionToken}`
  : "Fetching URL...";

return (
  <div style={styles.container}>
    {doctorData && !isPublicMode && (
      <>
        <h1 style={styles.title}>{doctorData?.name}</h1>
        
      </>
    )}
    {isPublicMode && (
      <>
        <h1 style={styles.title}>
         {DoctorName}
        </h1>        
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
      
      {!currentPatient && <p style={styles.noPatient}>no client is currently being served.</p>}
      
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
          {/* Patient Name Input Field */}
          <input
            type="text"
            value={newPatientName}
            onChange={(e) => setNewPatientName(e.target.value)}
            placeholder="Enter client's name"
            style={{ ...styles.input, width: "150px", marginBottom: "15px" }} // Matched width
          />
        
          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
            <button onClick={addPatient} style={{ ...styles.addButton, width: "150px" }}>
              Add Client
            </button>
        
            {currentPatient && (
              <button onClick={markAsDone} style={{ ...styles.doneButton, width: "150px" }}>
                Done (Next Client)
              </button>
            )}
        
            <button onClick={ResetAll} style={{ ...styles.resetButton, width: "150px" }}>
              Reset All
            </button>
          </div>
        </div>
      )}
    
    {!isPublicMode && (
      <div>
        <p>Share this URL with patients:</p>
        <input type="text" value={shareableUrl} readOnly style={styles.shareInput} />
        <button onClick={() => navigator.clipboard.writeText(shareableUrl)} style={styles.copyButton}>
          Copy
        </button>

        {qrCodeUrl && (
          <>
            <p>Display this QR code in your premesis so clients can connect with your live dashboard </p>
            <a href={qrCodeUrl} target="_blank" rel="noopener noreferrer" style={styles.qrLink}>
              View QR Code(select open in new tab)
            </a>
          </>
        )}
      </div>
    )}
    {/* Notice Board Section (Positioned at the Bottom) */}
      <div style={styles.noticeBoardContainer}>
        <h2>{DoctorName}</h2>
        <ul style={styles.noticeList}>
          {notices.length === 0 ? (
            <p style={styles.noNotices}>No notices available.</p>
          ) : (
            notices.map((notice, index) => (
              <li key={index} style={{ ...styles.noticeItem, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{notice}</span>
                {!isPublicMode && ( // Only doctors can remove notices
                  <button onClick={() => removeNotice(index)} style={styles.removeNoticeButton}>
                    ❌ Remove
                  </button>
                )}
              </li>
            ))
          )}
        </ul>
              {/* Only doctors can add notices */}
              {!isPublicMode && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <textarea
                    rows={5}
                    value={newNotice}
                    onChange={(e) => setNewNotice(e.target.value)}
                    placeholder="Write a new notice..."
                    style={{
                      ...styles.textArea,
                      flex: 1,
                      minHeight: "80px",
                    }}
                  />
                  <button onClick={addNotice} style={styles.addNoticeButton}>
                    Add Notice
                  </button>
                </div>
              )}

      </div>
      
    {!isPublicMode && (
      <button onClick={handleLogout} style={styles.logoutButton}>
        Logout
      </button>
    )}
    
    {isPublicMode && (
  <div>
    {/* Chatbot Button */}
    <button
      onClick={() => {
        toggleChat(); // Toggle the chat UI
      }}
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        backgroundColor: "#2980b9",
        color: "white",
        padding: "10px 20px",
        border: "none",
        borderRadius: "20px",
        cursor: "pointer",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      {isChatOpen ? "Close Chat" : "Chat with us"}
    </button>

    {/* Chat Window */}
    {isChatOpen && (
      <div
        style={{
          position: "fixed",
          bottom: "70px",
          left: "20px",
          width: "300px",
          height: "400px",
          backgroundColor: "#f4f4f9",
          borderRadius: "10px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
          display: "flex",
          flexDirection: "column",
          padding: "10px",
        }}
      >
        <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                textAlign: msg.sender === "user" ? "right" : "left",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  backgroundColor: msg.sender === "user" ? "#2980b9" : "#ddd",
                  color: msg.sender === "user" ? "white" : "black",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  display: "inline-block",
                }}
              >
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", padding: "10px" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, padding: "8px", borderRadius: "5px" }}
          />
          <button
            onClick={sendMessage}
            style={{
              marginLeft: "5px",
              padding: "8px 12px",
              backgroundColor: "#2980b9",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    )}
  </div>
)}
  </div>
);
}

// Styles (unchanged)
const styles = {
container: { textAlign: "center", marginTop: "50px", padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f4f4f4", minHeight: "100vh" },
title: { fontSize: "32px", fontWeight: "bold", color: "#2c3e50" },
subtext: { fontSize: "18px", color: "#444" },
averageTime: { fontSize: "20px", fontWeight: "bold", color: "#2980b9", marginTop: "10px" },
patientList: { listStyleType: "none", padding: 0, marginTop: "20px" },
patientItem: { fontSize: "18px", padding: "10px", backgroundColor: "#fff", margin: "5px auto", width: "80%", borderRadius: "5px", boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)" },
timer: { fontSize: "16px", color: "#d35400", fontWeight: "bold" },
logoutButton: { padding: "10px 20px", backgroundColor: "#2c3e50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", margin: "10px" },
shareInput: { width: "50%", padding: "5px", margin: "10px" },
copyButton: { padding: "5px 10px", backgroundColor: "#2980b9", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
removeNoticeButton: {
  padding: "5px 10px",
  backgroundColor: "#e74c3c",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
},
noticeBoardContainer: {
  textAlign: "center",
  padding: "20px",
  backgroundColor: "#f4f4f9",
  borderRadius: "10px",
  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
  width: "80%",
  margin: "20px auto",
},
noticeItem: {
  backgroundColor: "#fff",
  padding: "10px",
  margin: "5px 0",
  borderRadius: "5px",
  boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
},
textArea: {
  width: "100%",
  padding: "10px",
  borderRadius: "5px",
},
addNoticeButton: {
  padding: "10px 15px",
  backgroundColor: "#2980b9",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
},
};

export default DashboardPage;