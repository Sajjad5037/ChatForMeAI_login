import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function ChatbotPage({ doctorData }) {
  const location = useLocation();
  const server = "https://web-production-e5ae.up.railway.app";
  const sessionToken = doctorData?.session_token;

  const [publicToken, setPublicToken] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // Check if public mode
  const queryParams = new URLSearchParams(location.search);
  const publicTokenFromUrl = queryParams.get("publicToken");
  const isPublicMode = !!publicTokenFromUrl;

  // Fetch public token
  useEffect(() => {
    if (!isPublicMode && sessionToken) {
      fetch(`${server}/dashboard/public-token?session_token=${sessionToken}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setPublicToken(data.publicToken);
        })
        .catch(console.error);
    }
  }, [isPublicMode, sessionToken]);

  // Fetch QR Code
  useEffect(() => {
    if (!publicToken || !sessionToken) return;

    const qrCodeUrl = `${server}/generate-qr/${publicToken}/${sessionToken}`;
    fetch(qrCodeUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch QR code");
        return res.blob();
      })
      .then((blob) => setQrCodeUrl(URL.createObjectURL(blob)))
      .catch(console.error);
  }, [publicToken, sessionToken]);

  const shareableUrl =
    publicToken && sessionToken
      ? `${window.location.origin}/dashboard?publicToken=${publicToken}&sessionToken=${sessionToken}`
      : "Fetching URL...";

  return (
    <div className="share-section" style={{ maxWidth: 600, margin: "40px auto", textAlign: "center" }}>
      <h2>Share this URL with patients:</h2>
      <input
        type="text"
        value={shareableUrl}
        readOnly
        className="share-input"
        style={{ width: "100%", padding: "10px", fontSize: "16px" }}
      />
      <button
        onClick={() => navigator.clipboard.writeText(shareableUrl)}
        className="copy-button"
        style={{ marginTop: "10px", padding: "10px 20px", cursor: "pointer" }}
      >
        Copy
      </button>

      {qrCodeUrl && (
        <div className="qr-section" style={{ marginTop: "20px" }}>
          <p>Display this QR code so clients can connect with your dashboard:</p>
          <a href={qrCodeUrl} target="_blank" rel="noopener noreferrer">
            View QR Code (Open in new tab)
          </a>
        </div>
      )}
    </div>
  );
}

export default ChatbotPage;
