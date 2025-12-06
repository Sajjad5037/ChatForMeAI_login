import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import KnowledgeBaseUpload from "./KnowledgeBaseUpload";
import PublicChatbot from "./PublicChatbot";
import ApiUsage from "./ApiUsage";
import "./BusinessChatbot.css";

export default function BusinessChatbot({ doctorData }) {
  const server = "https://web-production-e5ae.up.railway.app";
  const server2 = "https://generalchatbot-production.up.railway.app";

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // ---------------- URL public mode detection ----------------
  const publicTokenFromUrl = queryParams.get("publicToken");
  const isPublicMode = Boolean(publicTokenFromUrl);

  // ---------------- ADMIN SESSION ----------------
  const sessionToken =
    doctorData?.session_token ||
    localStorage.getItem("sessionToken") ||
    null;

  // ---------------- SHARED STATE ----------------
  const [publicToken, setPublicToken] = useState(publicTokenFromUrl || null);
  const [shareLink, setShareLink] = useState("Fetching...");
  const [qrCode, setQrCode] = useState("");

  const [requirePassword, setRequirePassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  // ---------------- KNOWLEDGE BASE STATES ----------------
  const [documents, setDocuments] = useState([]);
  const [uploadMode, setUploadMode] = useState("new"); // "new" | "replace"
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  // ---------------- FETCH PUBLIC TOKEN FOR ADMIN ----------------
  useEffect(() => {
    if (isPublicMode || !sessionToken) return;

    fetch(`${server}/dashboard/public-token?session_token=${sessionToken}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.publicToken) {
          setPublicToken(data.publicToken);
          setRequirePassword(data.requirePassword || false);
        }
      })
      .catch(console.error);
  }, [isPublicMode, sessionToken, server]);

  // ---------------- BUILD SHARE LINK ----------------
  useEffect(() => {
    if (!publicToken) return;
    const link = `${window.location.origin}/chatbot?publicToken=${publicToken}`;
    setShareLink(link);
  }, [publicToken]);

  // ---------------- FETCH QR ----------------
  useEffect(() => {
    if (!publicToken) return;

    fetch(`${server}/generate-qr/${publicToken}`)
      .then((res) => res.blob())
      .then((blob) => setQrCode(URL.createObjectURL(blob)))
      .catch(console.error);
  }, [publicToken, server]);

  // ---------------- FETCH EXISTING DOCUMENTS FOR DOCTOR ----------------
  useEffect(() => {
     if (!doctorData?.id) {
      console.log("Doctor data not ready yet, skipping docs fetch");
      return;
    }

    fetch(`${server}/api/whatsapp-knowledge-base/list?user_id=${doctorData.id}`)
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data.documents || []);
      })
      .catch((err) => console.error("Docs Fetch Error:", err));
  }, [doctorData]);

  // ---------------- SAVE PASSWORD SETTINGS ----------------
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

  // ---------------- PUBLIC VIEW ----------------
  if (isPublicMode) {
    return <PublicChatbot publicToken={publicTokenFromUrl} server={server} />;
  }

  // ---------------- ADMIN VIEW ----------------
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Business Chatbot Center</h1>
      </header>

      {/* ---------------- KNOWLEDGE BASE SECTION ---------------- */}
      <section className="card knowledge-card">
        <h3 className="card-title">Knowledge Base</h3>

        {/* ---------- Mode selection UI ---------- */}
        <div className="mode-choice">
          <label>
            <input
              type="radio"
              value="new"
              checked={uploadMode === "new"}
              onChange={() => {
                setUploadMode("new");
                setSelectedDocumentId(null);
              }}
            />
            Upload New PDF
          </label>

          <label>
            <input
              type="radio"
              value="replace"
              checked={uploadMode === "replace"}
              onChange={() => setUploadMode("replace")}
            />
            Replace Existing PDF
          </label>
        </div>

        {/* Document dropdown when replacing */}
        {uploadMode === "replace" && (
          <select
            className="text-input full"
            value={selectedDocumentId || ""}
            onChange={(e) => setSelectedDocumentId(Number(e.target.value))}
          >
            <option value="">Select document to replace</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title || `Document ${doc.id}`}
              </option>
            ))}
          </select>
        )}

        {/* Upload Component */}
        <KnowledgeBaseUpload
          doctorData={doctorData}
          uploadMode={uploadMode}
          selectedDocumentId={selectedDocumentId}
        />
      </section>

      {/* ---------------- PASSWORD SETTINGS ---------------- */}
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
          <input
            type="text"
            placeholder="Enter access password"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            className="text-input full"
          />
        )}

        <button className="btn primary" onClick={handleSavePasswordSettings}>
          Save Settings
        </button>
      </section>

      {/* ---------------- SHARE LINK ---------------- */}
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

          {qrCode && <a className="qr-anchor" href={qrCode} target="_blank">Open QR</a>}
        </div>
      </section>

      {/* ---------------- API USAGE ---------------- */}
      <section className="card api-usage-card">
        <h3 className="card-title">API Usage</h3>
        <ApiUsage doctorData={doctorData} />
      </section>
    </div>
  );
}
