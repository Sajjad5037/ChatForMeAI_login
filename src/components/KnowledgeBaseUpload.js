import React, { useState } from "react";
import "./KnowledgeBaseUpload.css";

const KnowledgeBaseUpload = ({
  doctorData,
  uploadMode,            // coming from parent
  selectedDocumentId     // coming from parent
}) => {

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const [documentTitle, setDocumentTitle] = useState("");

  const server = "https://web-production-e5ae.up.railway.app";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  // ============================================================
  // ⭐ HANDLE UPLOAD — NEW + REPLACE MODES
  // ============================================================
  const handleUpload = async () => {
    console.log("⚡ New handleUpload triggered with:", {
      uploadMode,
      selectedDocumentId,
      documentTitle
    });

    // --- File validations ---
    if (!file) {
      setMessage("Please select a PDF file first.");
      return;
    }
    if (file.type !== "application/pdf") {
      setMessage("Only PDF files are allowed.");
      return;
    }

    // --- User validations ---
    if (!doctorData || !doctorData.id) {
      setMessage("User ID is missing. Cannot upload.");
      return;
    }

    // ---- Create FormData ----
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", doctorData.id.toString());
    formData.append("mode", uploadMode);   // ALWAYS passed from parent

    if (uploadMode === "replace") {
      if (!selectedDocumentId) {
        setMessage("Please select a document to replace.");
        return;
      }
      formData.append("document_id", selectedDocumentId.toString());
    }

    if (documentTitle.trim()) {
      formData.append("document_title", documentTitle);
    }

    console.log("📤 Final FormData Payload:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": ", pair[1]);
    }

    try {
      setUploading(true);
      setMessage("Uploading document…");

      const response = await fetch(`${server}/api/whatsapp-knowledge-base/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("📥 Server Response:", data);

      if (!response.ok) {
        setMessage(`❌ Upload failed: ${data.detail || "Unknown error"}`);
        return;
      }

      setMessage(
        `✅ Document uploaded! ID: ${data.document_id} | Chunks: ${data.chunks}`
      );

      // Reset UI
      setFile(null);

    } catch (err) {
      console.error("❌ Upload error:", err);
      setMessage("⚠️ Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ============================================================
  // RENDER UI
  // ============================================================

  return (
    <div className="knowledge-upload-card">
      <h3 className="upload-title">Upload Knowledge Base (PDF)</h3>

      {/* Document Title Input */}
      <input
        type="text"
        placeholder="Document title (optional)"
        value={documentTitle}
        onChange={(e) => setDocumentTitle(e.target.value)}
        disabled={uploading}
        className="title-input"
      />

      {/* File input */}
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        disabled={uploading}
        className="file-input"
      />

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="upload-button"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {/* Convert to PDF link */}
      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <a
          href="https://www.imagetotext.info/text-to-pdf"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
        >
          Convert text to PDF
        </a>
      </div>

      {/* Message Display */}
      {message && <p className="upload-message">{message}</p>}
    </div>
  );
};

export default KnowledgeBaseUpload;
