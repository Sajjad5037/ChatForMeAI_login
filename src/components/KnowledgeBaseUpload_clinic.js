import React, { useState } from "react";
import "./KnowledgeBaseUpload.css";

const KnowledgeBaseUpload_clinic = ({ doctorData, phoneNumber }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const server = "https://generalchatbot-production.up.railway.app";


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
  

  // --- File validations ---
  if (!file) {
    setMessage("Please select a PDF file first.");
    return;
  }
  if (file.type !== "application/pdf") {
    setMessage("Only PDF files are allowed.");
    return;
  }

  // --- Doctor data validation ---
  if (!doctorData || !doctorData.id) {
    setMessage("User ID is missing. Cannot upload.");
    return;
  }

   

  // --- Prepare FormData including file, user_id, and phone number ---
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", doctorData.id.toString()); // ensure it's a string
  
  try {
    setUploading(true);
    setMessage("");

    const response = await fetch(`${server}/api/knowledge-base/upload`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      setMessage(`✅ Knowledge base uploaded successfully! ID: ${data.knowledge_base_id}`);
      setFile(null);
    } else {
      // Try to parse error details
      let errorText = "Unknown error";
      try {
        const errorData = await response.json();
        errorText = errorData.detail || errorText;
      } catch {}
      setMessage(`❌ Upload failed: ${errorText}`);
    }
  } catch (error) {
    console.error("Upload error:", error);
    setMessage("⚠️ Network error. Please try again later.");
  } finally {
    setUploading(false);
  }
};


  return (
    <div className="knowledge-upload-card">
      <h3 className="upload-title">Upload Knowledge Base (PDF)</h3>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        disabled={uploading}
        className="file-input"
      />

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="upload-button"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {/* Clickable text below the button */}
      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <a
          href="https://www.imagetotext.info/text-to-pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="convert-link"
          style={{ color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
        >
          Convert text to PDF
        </a>
      </div>

      {message && <p className="upload-message">{message}</p>}
    </div>
  );
};

export default KnowledgeBaseUpload_clinic;
