import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PatientList from "./PatientList"; // kept (if unused you can remove)
import "./DashboardPage.css";
import KnowledgeBaseUpload from "./KnowledgeBaseUpload";

/**
 * DashboardPage
 * - Full functional rewrite with the same logic as your original file
 * - Improved readability & subtle dark theme styling separated into CSS
 * - Preserves all WebSocket logic, patient/notice/chat flows, QR generation, share URL behavior
 */
function DashboardPage({ setIsLoggedIn, doctorData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const server = "https://web-production-e5ae.up.railway.app";
  const sessionToken = doctorData?.session_token; // session token in authenticated mode
  const queryParams = new URLSearchParams(location.search);
  const publicTokenFromUrl = queryParams.get("publicToken");
  const isPublicMode = !!publicTokenFromUrl;

  // --- State (kept same semantics) ---
  const [doctorId, setDoctorId] = useState("");
  const [patients, setPatients] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [currentPatient, setCurrentPatient] = useState(null);
  const [newPatientName, setNewPatientName] = useState("");
  const [DoctorName, setDoctorName] = useState("");
  const [averageInspectionTime, setAverageInspectionTime] = useState(300); // seconds
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

  // --- helpers ---
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const toggleChat = () => setIsChatOpen((v) => !v);

  // --- messaging (chatbot) ---
  const sendMessage = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages((prev) => [...prev, { text: msg, sender: "user" }]);
    setInput("");

    try {
      const res = await fetch(`https://generalchatbot-production.up.railway.app/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, user_id: doctorId }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { text: data.reply ?? "No response", sender: "bot" }]);
    } catch (err) {
      console.error("Error fetching chatbot response:", err);
      setMessages((prev) => [...prev, { text: "Service unavailable", sender: "bot" }]);
    }
  };

  // --- QR code fetcher (use shareable url) ---
  const fetchQRCode = async (shareableUrl) => {
    if (!shareableUrl || shareableUrl === "Fetching URL...") {
      console.error("Shareable URL is not available for QR generation.");
      return;
    }
    try {
      const url = new URL(shareableUrl);
      const publicToken = url.searchParams.get("publicToken");
      const sessionToken = url.searchParams.get("sessionToken");
      if (!publicToken || !sessionToken) {
        console.error("Missing tokens in shareable URL.");
        return;
      }
      const qrApiUrl = `${server}/generate-qr/${publicToken}/${sessionToken}`;
      const response = await fetch(qrApiUrl);
      if (!response.ok) throw new Error("Failed to fetch QR code");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setQrCodeUrl(objectUrl);
    } catch (error) {
      console.error("Error fetching QR code:", error);
    }
  };

  // --- doctor info fetching (keeps original flow) ---
  useEffect(() => {
    const fetchDoctorData = async () => {
      const session_Token = new URLSearchParams(window.location.search).get("sessionToken");
      if (!session_Token) {
        // nothing to do
        return;
      }
      try {
        const idResp = await fetch(`${server}/get-doctor-id/${session_Token}`);
        const idData = await idResp.json();
        if (idData.doctor_id) {
          setDoctorId(idData.doctor_id);
          const nameResp = await fetch(`${server}/get-doctor-name/${idData.doctor_id}`);
          const nameData = await nameResp.json();
          if (nameData.doctor_name) {
            setDoctorName(nameData.doctor_name);
          } else {
            console.error("Error fetching doctor name:", nameData.detail ?? nameData);
          }
        } else {
          console.error("Error fetching doctor ID:", idData.error ?? idData);
        }
      } catch (err) {
        console.error("Network error fetching doctor ID/name:", err);
      }
    };

    fetchDoctorData();
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- public token fetch (authenticated mode) ---
  useEffect(() => {
    if (!isPublicMode) {
      if (!sessionToken) {
        console.warn("No session token found when attempting to fetch public token.");
        return;
      }
      fetch(`${server}/dashboard/public-token?session_token=${sessionToken}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.error) {
            console.error("Error fetching public token:", data.error);
          } else {
            setPublicToken(data.publicToken);
          }
        })
        .catch((err) => console.error("Error fetching public token:", err));
    }
  }, [isPublicMode, sessionToken]);

  // --- shareable url (kept behavior) ---
  const shareableUrl =
    publicToken && sessionToken
      ? `${window.location.origin}/dashboard?publicToken=${publicToken}&sessionToken=${sessionToken}`
      : "Fetching URL...";

  // generate QR when both tokens ready
  useEffect(() => {
    if (publicToken && sessionToken) {
      fetchQRCode(shareableUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicToken, sessionToken]);

  // --- timers (initialize timers for queue) ---
  useEffect(() => {
    if (!patients.length) {
      setTimers({});
      return;
    }

    const updated = {};
    for (let i = 1; i < patients.length; i++) {
      updated[i] = averageInspectionTime * i;
    }
    setTimers(updated);

    const interval = setInterval(() => {
      setTimers((prev) => {
        const copy = { ...prev };
        Object.keys(copy).forEach((key) => {
          copy[key] = Math.max(copy[key] - 1, 0);
        });
        return copy;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [patients, averageInspectionTime]);

  // --- WebSocket setup & message handling (logic preserved) ---
  useEffect(() => {
    // Prevent multiple connections
    if (wsRef.current) {
      console.log("WebSocket already connected.");
      return;
    }

    console.log("window.location.search:", window.location.search);

    const searchParams = new URLSearchParams(window.location.search);
    const extractedSessionToken = searchParams.get("sessionToken") || "";
    const resolvedSessionToken = isPublicMode ? extractedSessionToken : sessionToken;

    console.log("Resolved sessionToken for WS:", resolvedSessionToken, "isPublicMode:", isPublicMode);

    if (!resolvedSessionToken) {
      console.warn("No valid sessionToken found. WebSocket not connecting.");
      return;
    }

    // Use the non-public path used in your original (you used a commented conditional; using single ws path to keep consistent)
    const wsUrl = `wss://web-production-e5ae.up.railway.app/ws/${resolvedSessionToken}`;

    console.log("Connecting to WebSocket at:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket connected (${isPublicMode ? "public" : "authenticated"})`);
    };

    ws.onmessage = (event) => {
      console.log("WS message:", event.data);
      try {
        const message = JSON.parse(event.data);

        // If message only contains doctor_id (your original special case)
        if (Object.keys(message).length === 1 && "doctor_id" in message) {
          setDoctorId(message.doctor_id);
          return;
        }

        const { type, data } = message;

        // If message has session_token ensure it matches before applying
        if (data?.session_token && data.session_token !== resolvedSessionToken) {
          console.log("Session token mismatch; ignoring WS message.");
          return;
        }

        if (type === "update_state") {
          setPatients(data.patients || []);
          setCurrentPatient(data.currentPatient ?? null);
          setAverageInspectionTime(data.averageInspectionTime ?? 300);

          // initialize timers based on the new averageInspectionTime + patients
          const updatedTimers = {};
          for (let i = 1; i < (data.patients || []).length; i++) {
            updatedTimers[i] = (data.averageInspectionTime ?? 300) * i;
          }
          setTimers(updatedTimers);
        } else if (type === "update_notices") {
          setNotices(data.notices || []);
        } else if (type === "connection_closed") {
          alert("The broadcaster has disconnected. Redirecting to home.");
          // Reset UI state & navigate away (original behavior)
          setPatients([]);
          setCurrentPatient(null);
          setTimers({});
          setAverageInspectionTime(300);
          navigate("/");
        } else {
          // other message types (safe fallback)
          console.log("Unhandled WS type:", type);
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = (ev) => {
      console.warn("WebSocket closed:", ev.code, ev.reason);
    };

    return () => {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          /* ignore */
        }
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken, isPublicMode, navigate]);

  // --- WebSocket actions (kept functionality intact) ---
  const addPatient = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: "add_patient", patient: newPatientName, session_token: sessionToken })
      );
      setNewPatientName("");
    } else {
      console.warn("WebSocket not open, can't add patient.");
    }
  };

  const ResetAll = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "reset_all", session_token: sessionToken }));
    } else {
      console.warn("WebSocket not open, can't reset.");
    }
  };

  const addNotice = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "add_notice", notice: newNotice, session_token: sessionToken }));
      setNewNotice("");
    } else {
      console.warn("WebSocket not open, can't add notice.");
    }
  };

  const removeNotice = (index) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "remove_notice", index, session_token: sessionToken }));
    } else {
      console.warn("WebSocket not open, can't remove notice.");
    }
  };

  const markAsDone = () => {
    if (isPublicMode || !currentPatient) return; // maintain original behavior
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "mark_done", session_token: sessionToken }));
    }
  };

  const handleLogout = () => {
    try {
      wsRef.current?.send(JSON.stringify({ type: "close_connection", session_token: sessionToken }));
    } catch (err) {
      // ignore if socket closed
    }
    setIsLoggedIn(false);
  };

  // --- render ---
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">{isPublicMode ? DoctorName || "Clinic" : doctorData?.name || "Dashboard"}</h1>
        
      </header>

      <div className="meta-row">
        <div className="meta-card">
          <div className="meta-title">Average Inspection Time</div>
          <div className="meta-value">{formatTime(averageInspectionTime)} (MM:SS)</div>
        </div>
        <div className="meta-card">
          <div className="meta-title">Current Patient</div>
          <div className="meta-value">{currentPatient ?? "— none —"}</div>
        </div>
      </div>

      <section className="card waiting-card">
        <h2 className="card-title">Waiting List</h2>
        {!currentPatient && <p className="muted">no client is currently being served.</p>}
        <ul className="patients-ul">
          {patients.map((p, idx) => (
            <li key={idx} className="patient-row">
              <span className="patient-name">{p}</span>
              <span className="patient-wait">Wait: {formatTime(timers[idx] ?? 0)}</span>
            </li>
          ))}
        </ul>
      </section>

      {!isPublicMode && (
        <section className="card actions-card">
          <h3 className="card-title">Actions</h3>
          <div className="actions-row">
            <input
              type="text"
              className="text-input"
              value={newPatientName}
              onChange={(e) => setNewPatientName(e.target.value)}
              placeholder="Enter client's name"
            />
            <button className="btn primary" onClick={addPatient}>Add Client</button>
            {currentPatient && <button className="btn success" onClick={markAsDone}>Done (Next)</button>}
            <button className="btn warn" onClick={ResetAll}>Reset All</button>
          </div>
        </section>
      )}

      {!isPublicMode && (
        <section className="card share-card">
          <h3 className="card-title">Shareable Link & QR</h3>
          <div className="share-row">
            <input type="text" readOnly value={shareableUrl} className="text-input full" />
            <button className="btn ghost" onClick={() => navigator.clipboard.writeText(shareableUrl)}>Copy</button>
            {qrCodeUrl && (
              <a className="qr-anchor" href={qrCodeUrl} target="_blank" rel="noreferrer">Open QR (new tab)</a>
            )}
          </div>
        </section>
      )}

      <section className="card notices-card">
        <h3 className="card-title">Notice Board — {DoctorName}</h3>

        {notices.length === 0 ? (
          <p className="muted">No notices available.</p>
        ) : (
          <ul className="notices-ul">
            {notices.map((n, i) => (
              <li key={i} className="notice-row">
                <span>{n}</span>
                {!isPublicMode && <button className="btn small danger" onClick={() => removeNotice(i)}>❌</button>}
              </li>
            ))}
          </ul>
        )}

        {!isPublicMode && (
          <div className="notice-form">
            <textarea
              className="text-area"
              rows={4}
              value={newNotice}
              onChange={(e) => setNewNotice(e.target.value)}
              placeholder="Write a new notice..."
            />
            <div>
              <button className="btn primary" onClick={addNotice}>Add Notice</button>
            </div>
          </div>
        )}
      </section>
        {!isPublicMode && (
          <section className="card knowledge-card">
            <h3 className="card-title">Upload Knowledge Base</h3>
            <KnowledgeBaseUpload doctorData={doctorData} />
          </section>
        )}

      {!isPublicMode && (
        <div className="bottom-row">
          <button className="btn neutral" onClick={handleLogout}>Logout</button>
        </div>
      )}

      

      {/* Public-mode chatbot */}
      {isPublicMode && (
        <>
          <button className="chat-toggle" onClick={toggleChat}>{isChatOpen ? "Close Chat" : "Chat with us"}</button>

          {isChatOpen && (
            <div className="chat-window">
              <div className="chat-messages">
                {messages.map((m, i) => (
                  <div key={i} className={`chat-bubble ${m.sender === "user" ? "user" : "bot"}`}>
                    {m.text}
                  </div>
                ))}
              </div>

              <div className="chat-input-area">
                <input
                  type="text"
                  className="text-input"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                />
                <button className="btn primary" onClick={sendMessage}>Send</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DashboardPage;
