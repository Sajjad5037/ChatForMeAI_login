import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./DashboardPage.css";
import KnowledgeBaseUpload_clinic from "./KnowledgeBaseUpload_clinic";
import ApiUsage from "./ApiUsage";

function DashboardPage({ setIsLoggedIn, doctorData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const server = "https://web-production-e5ae.up.railway.app";
  const sessionToken = doctorData?.session_token;
  const queryParams = new URLSearchParams(location.search);
  const publicTokenFromUrl = queryParams.get("publicToken");
  const isPublicMode = !!publicTokenFromUrl;

  // ---------------- STATE ----------------
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

  const wsRef = useRef(null);

  // Collapsible UI states
  const [showQR, setShowQR] = useState(false); // default collapsed
  const [showActions, setShowActions] = useState(false);
  const [showNotices, setShowNotices] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [showAPI, setShowAPI] = useState(false);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  // ---------------- DOCTOR DATA ----------------
  useEffect(() => {
    const fetchDoctorData = async () => {
      const session_Token = new URLSearchParams(window.location.search).get("sessionToken");
      if (!session_Token) return;

      const idResp = await fetch(`${server}/get-doctor-id/${session_Token}`);
      const idData = await idResp.json();
      if (idData.doctor_id) {
        setDoctorId(idData.doctor_id);

        const nameResp = await fetch(`${server}/get-doctor-name/${idData.doctor_id}`);
        const nameData = await nameResp.json();
        if (nameData.doctor_name) setDoctorName(nameData.doctor_name);
      }
    };
    fetchDoctorData();
  }, []);

  // ---------------- PUBLIC TOKEN ----------------
  useEffect(() => {
    if (!isPublicMode && sessionToken) {
      fetch(`${server}/dashboard/public-token?session_token=${sessionToken}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.publicToken) setPublicToken(data.publicToken);
        });
    }
  }, [isPublicMode, sessionToken]);

  const shareableUrl =
    publicToken && sessionToken
      ? `${window.location.origin}/dashboard?publicToken=${publicToken}&sessionToken=${sessionToken}`
      : "";

  // ---------------- QR CODE ----------------
  useEffect(() => {
    if (!publicToken || !sessionToken) return;

    const genQR = async () => {
      try {
        const res = await fetch(`${server}/generate-qr-old/${publicToken}/${sessionToken}`);
        const blob = await res.blob();
        setQrCodeUrl(URL.createObjectURL(blob));
      } catch {}
    };
    genQR();
  }, [publicToken, sessionToken]);

  // ---------------- TIMERS ----------------
  useEffect(() => {
    if (!patients.length) return setTimers({});

    const initial = {};
    for (let i = 1; i < patients.length; i++) {
      initial[i] = averageInspectionTime * i;
    }
    setTimers(initial);

    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => (next[k] = Math.max(next[k] - 1, 0)));
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [patients, averageInspectionTime]);

  // ---------------- WEBSOCKET ----------------
  useEffect(() => {
    if (wsRef.current) return;

    const search = new URLSearchParams(window.location.search);
    const token = isPublicMode ? search.get("sessionToken") : sessionToken;

    if (!token) return;

    const ws = new WebSocket(`wss://web-production-e5ae.up.railway.app/ws/${token}`);
    wsRef.current = ws;

    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      const { type, data } = msg;

      if (msg.doctor_id) return setDoctorId(msg.doctor_id);

      if (data?.session_token && data.session_token !== token) return;

      if (type === "update_state") {
        setPatients(data.patients || []);
        setCurrentPatient(data.currentPatient || null);
        setAverageInspectionTime(data.averageInspectionTime || 300);
      }

      if (type === "update_notices") {
        setNotices(data.notices || []);
      }

      if (type === "connection_closed") {
        alert("Doctor disconnected.");
        navigate("/");
      }
    };

    return () => ws.close();
  }, [sessionToken, isPublicMode, navigate]);

  // ---------------- ACTIONS ----------------
  const addPatient = () => {
    wsRef.current?.send(
      JSON.stringify({
        type: "add_patient",
        patient: newPatientName,
        session_token: sessionToken,
      })
    );
    setNewPatientName("");
  };

  const ResetAll = () => {
    wsRef.current?.send(JSON.stringify({ type: "reset_all", session_token: sessionToken }));
  };

  const addNotice = () => {
    wsRef.current?.send(
      JSON.stringify({ type: "add_notice", notice: newNotice, session_token: sessionToken })
    );
    setNewNotice("");
  };

  const removeNotice = (i) => {
    wsRef.current?.send(
      JSON.stringify({ type: "remove_notice", index: i, session_token: sessionToken })
    );
  };

  const markAsDone = () => {
    if (!currentPatient) return;
    wsRef.current?.send(JSON.stringify({ type: "mark_done", session_token: sessionToken }));
  };

  const handleLogout = () => {
    wsRef.current?.send(JSON.stringify({ type: "close_connection", session_token: sessionToken }));
    setIsLoggedIn(false);
  };

  // ---------------- UI ----------------
  return (
    <div className="mobile-container">

      {/* HEADER */}
      <header className="mobile-header">
        <h2>{isPublicMode ? DoctorName || "Clinic" : doctorData?.name || "Dashboard"}</h2>
      </header>

      {/* ---------------- COLLAPSIBLE SHARE LINK SECTION ---------------- */}
      <div className="collapsible">
        <button className="collapse-btn" onClick={() => setShowQR(!showQR)}>
          Share Link & QR {showQR ? "▲" : "▼"}
        </button>

        {showQR && (
          <div className="collapse-content">
            <input className="text-input full" readOnly value={shareableUrl} />
            <button
              className="btn ghost"
              onClick={() => navigator.clipboard.writeText(shareableUrl)}
            >
              Copy
            </button>

            {qrCodeUrl && <img src={qrCodeUrl} alt="QR" className="qr-img" />}
          </div>
        )}
      </div>

      {/* ---------------- WAITING LIST ---------------- */}
      <div className="card compact-card">
        <h3>Waiting List</h3>
        {!currentPatient && <p className="muted">No client is being served.</p>}

        {patients.map((p, i) => (
          <div key={i} className="list-row">
            <span>{p}</span>
            <span>{formatTime(timers[i] || 0)}</span>
          </div>
        ))}
      </div>

      {/* ---------------- COLLAPSIBLE ACTIONS ---------------- */}
      {!isPublicMode && (
        <div className="collapsible">
          <button className="collapse-btn" onClick={() => setShowActions(!showActions)}>
            Actions {showActions ? "▲" : "▼"}
          </button>

          {showActions && (
            <div className="collapse-content">
              <input
                className="text-input"
                placeholder="Client name"
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
              />
              <button className="btn primary" onClick={addPatient}>
                Add Client
              </button>

              {currentPatient && (
                <button className="btn success" onClick={markAsDone}>
                  Done (Next)
                </button>
              )}

              <button className="btn warn" onClick={ResetAll}>
                Reset All
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- COLLAPSIBLE NOTICES ---------------- */}
      <div className="collapsible">
        <button className="collapse-btn" onClick={() => setShowNotices(!showNotices)}>
          Notices {showNotices ? "▲" : "▼"}
        </button>

        {showNotices && (
          <div className="collapse-content">
            {notices.map((n, i) => (
              <div key={i} className="list-row">
                <span>{n}</span>
                {!isPublicMode && (
                  <button className="btn small danger" onClick={() => removeNotice(i)}>
                    ❌
                  </button>
                )}
              </div>
            ))}

            {!isPublicMode && (
              <>
                <textarea
                  className="text-area"
                  value={newNotice}
                  onChange={(e) => setNewNotice(e.target.value)}
                  placeholder="Write a new notice..."
                />
                <button className="btn primary" onClick={addNotice}>
                  Add Notice
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ---------------- COLLAPSIBLE KNOWLEDGE BASE UPLOAD ---------------- */}
      {!isPublicMode && (
        <div className="collapsible">
          <button className="collapse-btn" onClick={() => setShowKnowledge(!showKnowledge)}>
            Knowledge Base Upload {showKnowledge ? "▲" : "▼"}
          </button>

          {showKnowledge && (
            <div className="collapse-content">
              <KnowledgeBaseUpload_clinic doctorData={doctorData} />
            </div>
          )}
        </div>
      )}

      {/* ---------------- COLLAPSIBLE API USAGE ---------------- */}
      {!isPublicMode && (
        <div className="collapsible">
          <button className="collapse-btn" onClick={() => setShowAPI(!showAPI)}>
            API Usage {showAPI ? "▲" : "▼"}
          </button>

          {showAPI && (
            <div className="collapse-content">
              <ApiUsage doctorData={doctorData} />
            </div>
          )}
        </div>
      )}

      {/* ---------------- LOGOUT ---------------- */}
      {!isPublicMode && (
        <button className="btn neutral logout-btn" onClick={handleLogout}>
          Logout
        </button>
      )}
    </div>
  );
}

export default DashboardPage;
