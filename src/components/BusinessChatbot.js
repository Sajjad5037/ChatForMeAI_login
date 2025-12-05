import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import KnowledgeBaseUpload from "./KnowledgeBaseUpload";
import PublicChatbot from "./PublicChatbot";
import ApiUsage from "./ApiUsage";
import "./BusinessChatbot.css";

export default function BusinessChatbot({ doctorData }) {
  const server = "https://web-production-e5ae.up.railway.app";
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // ----------------- URL MODE DETECTION -----------------
  const publicTokenFromUrl = queryParams.get("publicToken");
  const isPublicMode = !!publicTokenFromUrl;

  // ----------------- ADMIN SESSION -----------------
  const sessionToken =
    doctorData?.session_token ||
    localStorage.getItem("sessionToken") ||
    null;

  // ----------------- ADMIN STATE -----------------
  const [publicToken, setPublicToken] = useState(publicTokenFromUrl || null);
  const [shareLink, setShareLink] = useState("Fetching...");
  const [qrCode, setQrCode] = useState("");

  // Password protection state
  const [requirePassword, setRequirePassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  // ----------------- FETCH PUBLIC TOKEN FOR ADMIN -----------------
  useEffect(() => {
    if (!isPublicMode && sessionToken) {
      fetch(`${server}/dashboard/public-token?session_token=${sessionToken}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.publicToken) {
            setPublicToken(data.publicToken);
            setRequirePassword(data.requirePassword || false);
          }
        })
        .catch(console.error);
    }
  }, [isPublicMode, sessionToken]);

  // ----------------- BUILD SHARE LINK -----------------
  useEffect(() => {
    if (publicToken) {
      const url = `${window.location.origin}/chatbot?publicToken=${publicToken}`;
      setShareLink(url);
    }
  }, [publicToken]);

  // ----------------- FETCH QR CODE -----------------
  useEffect(() => {
    const fetchQR = async () => {
      if (!publicToken) return;

      try {
        const res = await fetch(`${server}/generate-qr/${publicToken}`);
        if (!res.ok) throw new Error("QR fetch failed");

        const blob = await res.blob();
        setQrCode(URL.createObjectURL(blob));
      } catch (err) {
        console.error(err);
      }
    };

    fetchQR();
  }, [publicToken]);

  // ----------------- SAVE PASSWORD SETTINGS -----------------
  const handleSavePasswordSettings = async () => {
    try {
      const res = await fetch(`${server}/chatbot/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_token: sessionToken,
          public_token: publicToken,
          require_password: requirePassword,
          password: requirePassword ? passwordValue : null,
        }),
      });

      const data = await res.json();
      alert(data.message || "Settings updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update settings.");
    }
  };

  // ----------------- PUBLIC VIEW -----------------
  if (isPublicMode) return <PublicChatbot doctorData={doctorData} />;

  // ----------------- ADMIN VIEW -----------------
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Business Chatbot Center</h1>
      </header>

      {/* --- Knowledge Base Upload --- */}
      {doctorData && (
        <section className="card knowledge-card">
          <h3 className="card-title">Upload Knowledge Base</h3>
          <KnowledgeBaseUpload doctorData={doctorData} />
        </section>
      )}

      {/* --- Password Protection Settings --- */}
      <section className="card password-card">
        <h3 className="card-title">Access Settings</h3>

        <div className="toggle-row">
          <label>Require Password to Access Chatbot</label>
          <input
            type="checkbox"
            checked={requirePassword}
            onChange={(e) => setRequirePassword(e.target.checked)}
          />
        </div>

        {requirePassword && (
          <div className="password-row">
            <input
              type="text"
              placeholder="Enter access password"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              className="text-input full"
            />
          </div>
        )}

        <button className="btn primary" onClick={handleSavePasswordSettings}>
          Save Settings
        </button>
      </section>

      {/* --- Shareable Link & QR --- */}
      <section className="card share-card">
        <h3 className="card-title">Shareable Link & QR</h3>
        <div className="share-row">
          <input type="text" readOnly value={shareLink} className="text-input full" />
          <button
            className="btn ghost"
            onClick={() => navigator.clipboard.writeText(shareLink)}
          >
            Copy
          </button>

          {qrCode && (
            <a className="qr-anchor" href={qrCode} target="_blank" rel="noreferrer">
              Open QR
            </a>
          )}
        </div>
      </section>

      {/* --- API Usage --- */}
      {doctorData && (
        <section className="card api-usage-card">
          <h3 className="card-title">API Usage</h3>
          <ApiUsage doctorData={doctorData} />
        </section>
      )}
    </div>
  );
}
