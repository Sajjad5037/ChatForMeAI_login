import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import KnowledgeBaseUpload_clinic from "./KnowledgeBaseUpload_clinic";
import ApiUsage from "./ApiUsage";
import "./DashboardPage.css";

function DashboardPage({ setIsLoggedIn, doctorData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const server = "https://web-production-e5ae.up.railway.app";
  const sessionToken = doctorData?.session_token;
  const publicTokenFromUrl = new URLSearchParams(location.search).get("publicToken");
  const isPublicMode = !!publicTokenFromUrl;

  const [doctorId, setDoctorId] = useState("");
  const [patients, setPatients] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [currentPatient, setCurrentPatient] = useState(null);
  const [newPatientName, setNewPatientName] = useState("");
  const [DoctorName, setDoctorName] = useState("");
  const [averageInspectionTime, setAverageInspectionTime] = useState(300);
  const [timers, setTimers] = useState({});
  const [publicToken, setPublicToken] = useState(null);
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");

  const wsRef = useRef(null);
  useEffect(() => {
    console.log("🔥 timers state updated:", timers);
  }, [timers]);

  // Collapsible UI state
  const [showQR, setShowQR] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showNotices, setShowNotices] = useState(false);
  const [showKB, setShowKB] = useState(false);
  const [showApiUsage, setShowApiUsage] = useState(false);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const toggleChat = () => setIsChatOpen((v) => !v);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const msg = input.trim();
    setMessages((prev) => [...prev, { text: msg, sender: "user" }]);
    setInput("");

    try {
      const res = await fetch(`${server}/api/chat-new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, user_id: doctorId }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { text: data.reply ?? "No response", sender: "bot" }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { text: "Service unavailable", sender: "bot" }]);
    }
  };

  const fetchQRCode = async (shareableUrl) => {
    try {
      const url = new URL(shareableUrl);
      const publicToken = url.searchParams.get("publicToken");
      const sessionToken = url.searchParams.get("sessionToken");

      if (!publicToken || !sessionToken) return;

      const qrApiUrl = `${server}/generate-qr-old/${publicToken}/${sessionToken}`;
      const response = await fetch(qrApiUrl);

      if (!response.ok) throw new Error("QR fetch failed");

      const blob = await response.blob();
      setQrCodeUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error("QR Error:", e);
    }
  };

  // Fetch doctor ID + name
  useEffect(() => {
    const fetchDoctorData = async () => {
      const session_Token = new URLSearchParams(window.location.search).get("sessionToken");
      if (!session_Token) return;

      try {
        const idResp = await fetch(`${server}/get-doctor-id/${session_Token}`);
        const idData = await idResp.json();

        if (idData.doctor_id) {
          setDoctorId(idData.doctor_id);

          const nameResp = await fetch(`${server}/get-doctor-name/${idData.doctor_id}`);
          const nameData = await nameResp.json();

          if (nameData.doctor_name) {
            setDoctorName(nameData.doctor_name);
          }
        }
      } catch (err) {
        console.error("Doctor data error:", err);
      }
    };

    fetchDoctorData();
  }, []);

  // Save doctorData to backend
  useEffect(() => {
    if (!doctorData) return;

    fetch(`https://generalchatbot-production.up.railway.app/save-doctor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: doctorData.id,
        name: doctorData.name,
        message: doctorData.message,
        public_token: doctorData.public_token,
        session_token: doctorData.session_token,
        specialization: doctorData.specialization,
      }),
    }).catch((err) => console.error("saveDoctor error:", err));
  }, [doctorData]);

  // Public token fetch
  useEffect(() => {
    if (!isPublicMode && sessionToken) {
      fetch(`${server}/dashboard/public-token?session_token=${sessionToken}`)
        .then((r) => r.json())
        .then((data) => {
          if (!data.error) setPublicToken(data.publicToken);
        })
        .catch(console.error);
    }
  }, [isPublicMode, sessionToken]);

  const shareableUrl =
    publicToken && sessionToken
      ? `${window.location.origin}/dashboard?publicToken=${publicToken}&sessionToken=${sessionToken}`
      : "";

  // Fetch QR once ready
  useEffect(() => {
    if (!isPublicMode && publicToken && sessionToken) {
      fetchQRCode(shareableUrl);
    }
  }, [publicToken, sessionToken]);

  // Timer logic
  

  // WebSocket
  useEffect(() => {
    if (wsRef.current) return;

    const searchParams = new URLSearchParams(window.location.search);
    const extractedSession = searchParams.get("sessionToken") || "";
    const resolvedToken = isPublicMode ? extractedSession : sessionToken;

    if (!resolvedToken) return;

    const ws = new WebSocket(`wss://web-production-e5ae.up.railway.app/ws/${resolvedToken}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { type, data } = msg;
    
        if (type === "update_state") {
          setPatients(data.patients || []);
          setCurrentPatient(data.currentPatient ?? null);
          setAverageInspectionTime(data.averageInspectionTime ?? 300);
        }
    
        if (type === "update_notices") {
          setNotices(data.notices || []);
        }
    
        if (type === "update_timers") {
          console.log("🟢 RECEIVED TIMERS:", msg.timers);
          setTimers(msg.timers || {});
        }
    
        if (type === "connection_closed") {
          alert("Doctor disconnected. Redirecting.");
          navigate("/");
        }
    
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };


    return () => ws.close();
  }, [sessionToken, isPublicMode, navigate]);

  // WebSocket actions
  const addPatient = () => {
    if (!wsRef.current) return;
    wsRef.current.send(
      JSON.stringify({
        type: "add_patient",
        patient: newPatientName,
        session_token: sessionToken,
      })
    );
    setNewPatientName("");
  };

  const ResetAll = () => {
    wsRef.current?.send(
      JSON.stringify({ type: "reset_all", session_token: sessionToken })
    );
  };

  const addNotice = () => {
    wsRef.current?.send(
      JSON.stringify({ type: "add_notice", notice: newNotice, session_token: sessionToken })
    );
    setNewNotice("");
  };

  const removeNotice = (index) => {
    wsRef.current?.send(
      JSON.stringify({ type: "remove_notice", index, session_token: sessionToken })
    );
  };

  const markAsDone = () => {
    if (!currentPatient || isPublicMode) return;
    wsRef.current?.send(JSON.stringify({ type: "mark_done", session_token: sessionToken }));
  };

  const handleLogout = () => {
    wsRef.current?.send(JSON.stringify({ type: "close_connection", session_token: sessionToken }));
    setIsLoggedIn(false);
  };

  return (
    <div className="mobile-container">

      {/* Doctor name header */}
      <h2 style={{ marginBottom: 12, marginTop: 8 }}>{DoctorName || "Clinic"}</h2>

      {/* -------- WAITING LIST (ALWAYS VISIBLE) -------- */}
      <div className="compact-card">
        <h3 style={{ marginTop: 0 }}>Waiting List</h3>

        {!currentPatient && <p>No client is being served.</p>}

        {patients.map((p, idx) => {
          const timeLeft = timers[String(idx)] ?? 0;
          return (
            <div key={idx} className="patient-row">
              <span>{p}</span>
              <span>{formatTime(timeLeft)}</span>
            </div>
          );
        })}

      </div>

      {/* -------- SHARE LINK + QR (ONLY WHEN LOGGED IN) -------- */}
      {!isPublicMode && (
        <div className="compact-card">
          <button className="collapse-btn" onClick={() => setShowQR(!showQR)}>
            <span>Share Link and QR Code for Patient Access</span>
            <span>{showQR ? "▲" : "▼"}</span>
          </button>
        
          {showQR && (
            <div className="collapse-content">
              <input
                className="text-input full"
                readOnly
                value={shareableUrl}
              />
        
              <button
                className="btn ghost"
                onClick={() => navigator.clipboard.writeText(shareableUrl)}
                style={{ marginTop: 10 }}
              >
                Copy
              </button>
        
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="QR"
                  className="qr-img"
                  style={{ marginTop: 14 }}
                />
              ) : (
                <p className="muted" style={{ marginTop: 10 }}>Generating QR…</p>
              )}
            </div>
          )}
        </div>

      )}

      {/* -------- ACTIONS -------- */}
      {!isPublicMode && (
        <div className="compact-card">
          <button className="collapse-btn" onClick={() => setShowActions(!showActions)}>
            Add Patients To Waiting List
            <span>{showActions ? "▲" : "▼"}</span>
          </button>

          {showActions && (
            <div className="collapse-content">
              <input
                className="text-input"
                placeholder="Client name"
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
              />
              <button className="btn primary" onClick={addPatient} style={{ marginTop: 8 }}>
                Add Client
              </button>

              {currentPatient && (
                <button className="btn success" onClick={markAsDone} style={{ marginTop: 8 }}>
                  Done (Next)
                </button>
              )}

              <button className="btn warn" onClick={ResetAll} style={{ marginTop: 8 }}>
                Reset All
              </button>
            </div>
          )}
        </div>
      )}

      {/* -------- NOTICES -------- */}
      <div className="compact-card">

        {/* Doctors see the collapsible heading. Public users do not. */}
        {!isPublicMode && (
          <button className="collapse-btn" onClick={() => setShowNotices(!showNotices)}>
            Share key notifications with your patients
            <span>{showNotices ? "▲" : "▼"}</span>
          </button>
        )}
      
        {/* Public mode always shows notices. Doctors see it only when expanded. */}
        {(isPublicMode || showNotices) && (
          <div className="collapse-content">
            {notices.map((n, i) => (
              <div key={i} className="notice-row">
                <span>{n}</span>
      
                {/* Delete button only for doctors */}
                {!isPublicMode && (
                  <button className="btn small danger" onClick={() => removeNotice(i)}>
                    ❌
                  </button>
                )}
              </div>
            ))}
      
            {/* Notice input only for doctors */}
            {!isPublicMode && (
              <>
                <textarea
                  className="text-area"
                  placeholder="Write a notice..."
                  value={newNotice}
                  onChange={(e) => setNewNotice(e.target.value)}
                />
                <button className="btn primary" onClick={addNotice} style={{ marginTop: 8 }}>
                  Add Notice
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* -------- KNOWLEDGE BASE -------- */}
      {!isPublicMode && (
        <div className="compact-card">
          <button className="collapse-btn" onClick={() => setShowKB(!showKB)}>
            Upload Your Knowledge Base to Train the AI
            <span>{showKB ? "▲" : "▼"}</span>
          </button>

          {showKB && (
            <div className="collapse-content">
              <KnowledgeBaseUpload_clinic doctorData={doctorData} />
            </div>
          )}
        </div>
      )}

      {/* -------- API USAGE -------- */}
      {!isPublicMode && (
        <div className="compact-card">
          <button className="collapse-btn" onClick={() => setShowApiUsage(!showApiUsage)}>
            API Usage
            <span>{showApiUsage ? "▲" : "▼"}</span>
          </button>

          {showApiUsage && (
            <div className="collapse-content">
              <ApiUsage doctorData={doctorData} />
            </div>
          )}
        </div>
      )}

      {/* -------- LOGOUT -------- */}
      {!isPublicMode && (
        <div className="compact-card">
          <button className="btn neutral" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      {/* -------- PUBLIC CHAT MODE -------- */}
      {isPublicMode && (
        <>
          <button className="chat-toggle" onClick={toggleChat}>
            {isChatOpen ? "Close Chat" : "Chat with us"}
          </button>

          {isChatOpen && (
            <div className="chat-window">
              <div className="chat-messages">
                {messages.map((m, i) => (
                  <div key={i} className={`chat-bubble ${m.sender}`}>
                    {m.text}
                  </div>
                ))}
              </div>

              <div className="chat-input-area">
                <input
                  className="text-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                />
                <button className="btn primary" onClick={sendMessage}>
                  Send
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DashboardPage;
