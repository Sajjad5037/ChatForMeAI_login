import React, { useState } from "react";
import "./KnowledgeBaseUpload.css";

const KnowledgeBaseUpload = ({ doctorData }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const server = "generalchatbot-production.up.railway.app";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
  if (!file) {
    setMessage("Please select a PDF file first.");
    return;
  }

  if (file.type !== "application/pdf") {
    setMessage("Only PDF files are allowed.");
    return;
  }

  if (!doctorData || !doctorData.id) {
    setMessage("User ID is missing. Cannot upload.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", doctorData.id); // send the required user ID

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
      const errorData = await response.json();
      setMessage(`❌ Upload failed: ${errorData.detail || "Unknown error"}`);
    }
  } catch (error) {
    console.error(error);
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

      {message && <p className="upload-message">{message}</p>}
    </div>
  );
};

export default KnowledgeBaseUpload;
