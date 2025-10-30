
import { React,useState, useEffect,useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const BACKEND_URL = 'https://your-railway-backend-url/api/orders';

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '50px',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f4f4',
    minHeight: '100vh',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    width: '60%',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginBottom: '10px',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#2980b9',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    margin: '5px',
  },
  selectBox: {
    width: '60%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    backgroundColor: 'white',
  },
  section: {
    backgroundColor: '#fff',
    padding: '20px',
    margin: '20px auto',
    width: '80%',
    borderRadius: '5px',
    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.2)',
  },
  noticeBoard: {
    backgroundColor: '##D3D3D3',
    padding: '15px',
    margin: '20px auto',
    width: '80%',
    borderRadius: '5px',
    fontWeight: 'bold',
    color: '#333',
    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.2)',
  },
  noticeItem: {
    backgroundColor: '#fff',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    boxShadow: '0px 0px 3px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuImage: {  // ✅ Added this for uniform image styling  
    width: '120px',  
    height: '120px',  
    objectFit: 'cover',  
    borderRadius: '8px' // Optional: Rounds the corners  
  }  
};


const RealEstate = ({ setIsLoggedIn, doctorData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const server="https://web-production-e5ae.up.railway.app"
  //const server = "http://localhost:3000"
  const sessionToken = doctorData?.session_token
  const queryParams = new URLSearchParams(location.search);
  
  const publicTokenFromUrl = queryParams.get("publicToken");
  const isPublicMode = !!publicTokenFromUrl;

  const [cart, setCart] = useState([]);
  const [orderStatus, setOrderStatus] = useState(null);

  console.log("publicTokenFromUrl:", publicTokenFromUrl);
  console.log("isPublicMode:", isPublicMode);

  const [preparingList, setPreparingList] = useState([]);
  const [servingList, setServingList] = useState([]);
  const [orderList,setOrderList]=useState([])
  const [newItem, setNewItem] = useState('');
  const [selectedPreparingIndex, setSelectedPreparingIndex] = useState(0);
  const [SelectedOrderIndex,setSelectedOrderIndex]=useState(0);

  const [selectedServingIndex, setSelectedServingIndex] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [doctorId, setDoctorId] = useState("");
  const [DoctorName,setDoctorName]=useState("");
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "bot" },
  ]);
  const [publicToken, setPublicToken] = useState(null);
  const [input, setInput] = useState("");
  // Reference to the WebSocket connection
  const wsRef = useRef(null);
  

  // Notice board state
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState('');

  
  
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
  // Handle logout (only for authenticated mode)
  const handleLogout = async () => {
    
    wsRef.current.send(JSON.stringify({ type: "close_connection",session_token: sessionToken }));
    setIsLoggedIn(false);   
             
  };
  
  const getSessionTokenFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("sessionToken"); // Extract sessionToken
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
          const shareableUrl = `${window.location.origin}/RealEstate?publicToken=${publicToken}&sessionToken=${sessionToken}`;         
          fetchQRCode(shareableUrl); // Call fetchQRCode after it's set
        }
      }, [publicToken, sessionToken]); // Runs when tokens are ready

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
    const publicTokenFromUrl = searchParams.get("publicToken") || "";

  // Determine WebSocket URL based on the mode
  /*
  const wsUrl = isPublicMode
    ? `wss://web-production-e5ae.up.railway.app/ws/public/OrderManager/${resolvedSessionToken}/${publicTokenFromUrl}`
    : `wss://web-production-e5ae.up.railway.app/ws/OrderManager/${resolvedSessionToken}`;
*/
  const wsUrl=`wss://web-production-e5ae.up.railway.app/ws/RealEstate/${resolvedSessionToken}`;
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
        if (type === "connection_closed") {
          console.log("Broadcaster has disconnected, stopping UI updates...");
          alert("The broadcaster has disconnected. Please wait or refresh.");
          setNotices([])
                     
        }  else if (type === "update_state") {
            
            
            setNotices(data.notices || []);
            
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
  const shareableUrl = publicToken && sessionToken
  ? `${window.location.origin}/RealEstate?publicToken=${publicToken}&sessionToken=${sessionToken}`
  : "Fetching URL...";

  

  // Notice board handlers
  const handleAddNotice = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && newNotice.trim() !== '') {
        wsRef.current.send(JSON.stringify({
            type: "add_notice",
            notice: newNotice.trim(),
            session_token: sessionToken
        }));
        setNewNotice(''); // Reset input after sending
    }
};

const handleRemoveNotice = (index) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
            type: "remove_notice",
            index: index,
            session_token: sessionToken
        }));
    }
};
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Real Estate</h2>     
      
      {/* Notice Board Section */}
      <div style={styles.noticeBoard}>
        <h3>Notice Board</h3>
        <div style={{ marginBottom: '10px' }}>
        {!isPublicMode && (
          <>
            <input
              type="text"
              value={newNotice}
              onChange={(e) => setNewNotice(e.target.value)}
              placeholder="Enter notice"
              style={{ ...styles.input, width: '70%' }}
            />
            <button onClick={handleAddNotice} style={styles.button}>Add Notice</button>
          </>
        )}
        </div>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {notices.map((notice, index) => (
            <li key={index} style={styles.noticeItem}>
              <span>{notice}</span>
              
              {!isPublicMode && (
                <button onClick={() => handleRemoveNotice(index)} style={styles.button}>
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
        
      </div>
      
  
      
      {!isPublicMode && (
      <div>
        <p>Share this URL with patients:</p>
        <input type="text" value={shareableUrl} readOnly style={styles.shareInput} />
        <button onClick={() => navigator.clipboard.writeText(shareableUrl)} style={styles.copyButton}>
          Copy
        </button>
      
        {qrCodeUrl && (
          <>
            <p>Display this QR code in your premises so clients can connect with your dashboard</p>
            <a href={qrCodeUrl} target="_blank" rel="noopener noreferrer" style={styles.qrLink}>
              View QR Code (select open in new tab)
            </a>
      
            {/* Ensure Logout Button Appears Below */}
            {!isPublicMode && (
              <div style={{ marginTop: '10px' }}> {/* Added a div for block-level behavior */}
                <button onClick={handleLogout} style={styles.button}>Logout</button>
              </div>
            )}
          </>
        )}
      </div>
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
};

export default RealEstate;
