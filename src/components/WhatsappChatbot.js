import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import KnowledgeBaseUpload from "./KnowledgeBaseUpload";
import PublicChatbot from "./PublicChatbot"; // <-- import public chatbot
import "./WhatsappChatbot.css";
import ApiUsage from "./ApiUsage";

export default function WhatsappChatbot({ doctorData }) {
  const server = "https://web-production-e5ae.up.railway.app";
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // --- Tokens ---
  const publicTokenFromUrl = queryParams.get("publicToken");
  const sessionTokenFromUrl = queryParams.get("sessionToken");

   // --- Debug doctorData ---
  console.log("DEBUG: doctorData in BusinessChatbot:", doctorData);
  console.log("DEBUG: doctorData.id in BusinessChatbot:", doctorData?.id);

  const sessionToken =
    doctorData?.session_token ||
    sessionTokenFromUrl ||
    localStorage.getItem("sessionToken") ||
    null;

  const isPublicMode = !!publicTokenFromUrl;

  // --- Admin state ---
  const [publicToken, setPublicToken] = useState(publicTokenFromUrl || null);
  const [shareableUrl, setShareableUrl] = useState("Fetching URL...");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // ----------------- Admin: fetch public token if authenticated -----------------
  useEffect(() => {
    if (!isPublicMode && sessionToken) {
      fetch(`${server}/dashboard/public-token?session_token=${sessionToken}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.publicToken) setPublicToken(data.publicToken);
        })
        .catch((err) => console.error(err));
    }
  }, [isPublicMode, sessionToken]);

  // ----------------- Admin: build shareable URL -----------------
  useEffect(() => {
    if (publicToken && sessionToken) {
      const url = `${window.location.origin}/chatbot?publicToken=${publicToken}&sessionToken=${sessionToken}`;
      setShareableUrl(url);
    }
  }, [publicToken, sessionToken]);

  // ----------------- Admin: fetch QR code -----------------
  useEffect(() => {
    const fetchQRCode = async (url) => {
      if (!url || url === "Fetching URL...") return;
      try {
        const qrUrl = new URL(url);
        const pub = qrUrl.searchParams.get("publicToken");
        const ses = qrUrl.searchParams.get("sessionToken");
        const qrApiUrl = `${server}/generate-qr/${pub}/${ses}`;
        const res = await fetch(qrApiUrl);
        if (!res.ok) throw new Error("Failed to fetch QR code");
        const blob = await res.blob();
        setQrCodeUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error(err);
      }
    };
    if (publicToken && sessionToken) fetchQRCode(shareableUrl);
  }, [publicToken, sessionToken, shareableUrl]);

  // ----------------- Render -----------------
  if (isPublicMode) {
    // ----------- PUBLIC VIEW: render PublicChatbot with doctorData -----------
    return <PublicChatbot doctorData={doctorData} />;
  }

  // ----------- ADMIN VIEW -----------
  return (
  <div className="dashboard-container">
    <header className="dashboard-header">
      <h1 className="dashboard-title">Business Chatbot Center</h1>
    </header>

    {/* --- Knowledge Base Upload --- */}
    {!isPublicMode && doctorData && (
    <section className="card knowledge-card">
      <h3 className="card-title">Upload Knowledge Base</h3>
  
      {/* Phone number input */}
      <div className="form-group" style={{ marginBottom: "1rem" }}>
        <label htmlFor="phoneNumber" className="form-label">
          WhatsApp Phone Number
        </label>
        <input
          type="text"
          id="phoneNumber"
          name="phoneNumber"
          placeholder="Enter your phone number"
          className="form-input"
          value={phoneNumber}           // controlled state
          onChange={(e) => setPhoneNumber(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem" }}
        />
      </div>
  
      {/* Knowledge Base Upload Component */}
      <KnowledgeBaseUpload doctorData={doctorData} />
    </section>
  )}

    

    {/* --- Shareable Link & QR --- */}
    <section className="card share-card">
      <h3 className="card-title">Shareable Link & QR</h3>
      <div className="share-row">
        <input
          type="text"
          readOnly
          value={shareableUrl}
          className="text-input full"
        />
        <button
          className="btn ghost"
          onClick={() => navigator.clipboard.writeText(shareableUrl)}
        >
          Copy
        </button>
        {qrCodeUrl && (
          <a
            className="qr-anchor"
            href={qrCodeUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open QR
          </a>
        )}
      </div>
    </section>
    {/* --- API Usage --- */}
    {!isPublicMode && doctorData && (
      <section className="card api-usage-card">
        <h3 className="card-title">API Usage</h3>
        <ApiUsage doctorData={doctorData} />
      </section>
    )}
  </div>
);

}
