import React, { useState } from "react";
import "./KnowledgeBaseUpload.css";

const KnowledgeBaseUpload = ({ doctorData }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // New states for document system
  const [uploadMode, setUploadMode] = useState("new");         // "new" or "replace"
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [documentTitle, setDocumentTitle] = useState("");

  const server = "https://web-production-e5ae.up.railway.app";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  /*  
  -------------------------------------------------------------
  🚫 OLD handleUpload (COMMENTED OUT)
  -------------------------------------------------------------

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
    formData.append("user_id", doctorData.id.toString());

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
  -------------------------------------------------------------
  END OLD
  -------------------------------------------------------------
  */

  // ============================================================
  // ⭐ NEW HANDLE UPLOAD — SUPPORTS NEW + REPLACE MODES
  // ============================================================
  const handleUpload = async () => {
    console.log("⚡ New handleUpload triggered");

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
    formData.append("mode", uploadMode); // "new" or "replace"

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

    console.log("📤 Upload Payload:", {
      user_id: doctorData.id,
      uploadMode,
      selectedDocumentId,
      documentTitle,
      filename: file.name,
    });

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
        `✅ Document uploaded successfully! Document ID: ${data.document_id} | Chunks created: ${data.chunks}`
      );

      // Reset UI
      setFile(null);
      setSelectedDocumentId(data.document_id);

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

      {/* Mode selection */}
      <div className="upload-mode-selector">
        <label>
          <input
            type="radio"
            value="new"
            checked={uploadMode === "new"}
            onChange={() => setUploadMode("new")}
          />
          Upload New Document
        </label>

        <label>
          <input
            type="radio"
            value="replace"
            checked={uploadMode === "replace"}
            onChange={() => setUploadMode("replace")}
          />
          Replace Existing
        </label>
      </div>

      {/* Document ID input (used when replacing) */}
      {uploadMode === "replace" && (
        <input
          type="number"
          placeholder="Document ID to replace"
          value={selectedDocumentId || ""}
          onChange={(e) => setSelectedDocumentId(e.target.value)}
          className="document-id-input"
          disabled={uploading}
        />
      )}

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
          className="convert-link"
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
