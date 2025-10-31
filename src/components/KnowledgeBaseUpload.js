import React, { useState } from "react";
import "./KnowledgeBaseUpload.css";

const KnowledgeBaseUpload = ({ doctorData, phoneNumber }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const server = "https://generalchatbot-production.up.railway.app";


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
  // --- Phone number validation ---
  const phoneRegex = /^03\d{9}$/; // starts with 03, followed by 9 digits
  if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
    setMessage("Please enter a valid phone number in the format 03004112884.");
    return; // stop execution if phone number is invalid
  }

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

    // --- Convert to international format before sending ---
  const normalizedPhone = "92" + phoneNumber.slice(1); // "03004112884" → "923004112884"
  console.log("[DEBUG] Normalized phone number:", normalizedPhone);


  // --- Prepare FormData including file, user_id, and phone number ---
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", doctorData.id.toString()); // ensure it's a string
  formData.append("phone_number", normalizedPhone);         // add phone number

  try {
    setUploading(true);
    setMessage("");

    const response = await fetch(`${server}/api/whatsapp-knowledge-base/upload`, {
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

      {message && <p className="upload-message">{message}</p>}
    </div>
  );
};

export default KnowledgeBaseUpload;
