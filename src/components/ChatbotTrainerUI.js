import React, { useState } from 'react';
import { marked } from 'marked';


const ChatbotTrainerUI = ({ doctorData }) => {
  
  const [pdfs, setPdfs] = useState([]);
  const [selectedPDFs, setSelectedPDFs] = useState([]);
  const [chatLog, setChatLog] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [sessionId, setSessionId] = React.useState(null);  // store sessionId in state
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  // File input ref
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length + images.length > 10) {
      alert('You can only upload up to 10 images.');
      return;
    }

    setImages(prev => [...prev, ...selectedFiles]);
  };
  const handleImageSelect = (event) => {
    const options = event.target.options;
    const selectedNames = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selectedNames.push(options[i].value);
    }

    setSelectedImages(images.filter(img => selectedNames.includes(img.name)));
  };

  const handlePDFSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setSelectedPDFs(selected);
  };

  const handleRemoveSelected = () => {
    setImages(prevImages =>
        prevImages.filter(img => !selectedImages.some(sel => sel.name === img.name))
    );
    setSelectedImages([]);
    };

  const handleTrain = async () => {
  if (images.length === 0) {
    alert("Please upload at least one image before training.");
    return;
  }

  try {
    setIsLoading(true); 
    const formData = new FormData();

    // Append each image
    images.forEach((img) => {
      formData.append("images", img); // Backend expects "images"
    });

    // Append doctorData as JSON string
    formData.append("doctorData", JSON.stringify(doctorData)); // Backend expects "doctorData" as a form field

    // Optional: Set loading state here
    // setIsLoading(true);

    const response = await fetch("https://usefulapis-production.up.railway.app/train-on-images", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    // Display summary result to user
    alert(`✅ Training successful!
🆔 Session ID: ${result.session_id}
🖼️ Images processed: ${result.images_processed}
📝 Total text length: ${result.total_text_length}`);
    setChatLog((prev) => [
  ...prev,
  { type: "bot", message: result.corrected_text },  // reply is already the HTML-formatted text
]);

    // Store session_id for future chat use
    setSessionId(result.session_id);
    setShowRightPanel(true);

  } catch (error) {
    console.error("❌ Error during training:", error);
    alert("Training failed. Please check your data and try again.");
  } finally {
    setIsLoading(false)
  }
};

  const handleRemoveTraining = () => {
    alert("Previous training removed.");
  };

  const handleSendMessage = async () => {
  if (!userInput.trim()) return;
  if (!sessionId) {
    alert("Please train first to get a session ID.");
    return;
  }

  try {
    const response = await fetch("https://usefulapis-production.up.railway.app/chat_interactive_tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        message: userInput,
        first_message: chatLog.length === 0,
      }),
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();

    setChatLog((prev) => [
      ...prev,
      { type: "user", message: userInput },
      { type: "bot", message: data.reply },  // reply is already the HTML-formatted text
    ]);

    setUserInput("");
  } catch (error) {
    console.error(error);
    alert("Failed to get response from the tutor.");
  }
};

  const handleShowContext = () => {
    alert("Show current training context (stub)");
  };

  return (
  <div
  style={{
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "stretch",   // stretch panels vertically
    width: "100%",
    minHeight: "70vh",      // ✅ always fill full viewport height
    padding: 20,
    gap: 20,
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
    backgroundColor: "#f0f2f5",
  }}
>
    {/* Left Panel */}
    <div
      style={{
        width: 300,
        padding: 20,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <h3 style={{ textAlign: "center", color: "#333", marginBottom: 20 }}>
        Upload image of your creative writing and learn from AI
      </h3>

      <select
        multiple
        value={selectedImages.map((img) => img.name)}
        onChange={handleImageSelect}
        style={{
          flex: 1,
          minHeight: 120,
          width: "100%",
          padding: 10,
          marginBottom: 15,
          borderRadius: 5,
          border: "1px solid #ccc",
          boxSizing: "border-box",
        }}
      >
        {images.map((file, index) => (
          <option key={index} value={file.name}>
            {file.name}
          </option>
        ))}
      </select>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label
          htmlFor="fileInput"
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            borderRadius: 5,
            cursor: "pointer",
            textAlign: "center",
            userSelect: "none",
          }}
        >
          Upload Image
        </label>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          onClick={handleRemoveSelected}
          style={{
            padding: 10,
            borderRadius: 5,
            color: "#fff",
            backgroundColor: "#FF0000",
            cursor: "pointer",
            border: "none",
          }}
        >
          Remove
        </button>
        <button
          onClick={handleTrain}
          style={{
            padding: 10,
            borderRadius: 5,
            color: "#fff",
            backgroundColor: "#4CAF50",
            cursor: "pointer",
            border: "none",
          }}
        >
          Send your essay for checking...
        </button>
         {/* Loader / Processing Indicator */}
        {isLoading && (
          <div className="loader">
            <img src="/spinner.gif" alt="Processing..." />
            <p>Processing images, please wait...</p>
          </div>
        )}
      </div>
    </div>

    {/* Right Panel */}
    <div
  style={{
    flex: 1,                 // ⬅️ take all remaining vertical space
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,            // ⬅️ important for inner scroll to work
    boxSizing: "border-box",
  }}
>
      <h3 style={{ textAlign: "center", color: "#333", marginBottom: 20 }}>
        Virtual Creative Writing Coach
      </h3>

      {/* Scrollable chat messages */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          marginBottom: 15,
          border: "1px solid #ddd",
          padding: 15,
          borderRadius: 8,
          backgroundColor: "#fff",
          boxSizing: "border-box",
        }}
      >
        {chatLog.map((msg, index) => {
          const cleanedMessage =
            msg.type === "bot"
              ? msg.message.replace(/([^\.\?\!])\n/g, "$1 ").replace(/\n/g, "<br>")
              : msg.message;
          return (
            <div
              key={index}
              style={{
                marginBottom: 10,
                textAlign: msg.type === "user" ? "right" : "left",
              }}
            >
              {msg.type === "bot" ? (
                <div
                  style={{
                    display: "block",
                    backgroundColor: "#f1f1f1",
                    padding: 10,
                    borderRadius: 10,
                    maxWidth: "90%",
                    wordWrap: "break-word",
                    lineHeight: 1.6,
                  }}
                  dangerouslySetInnerHTML={{ __html: marked.parse(cleanedMessage) }}
                />
              ) : (
                <div
                  style={{
                    display: "inline-block",
                    backgroundColor: "#f1f1f1",
                    padding: 10,
                    borderRadius: 10,
                    maxWidth: "70%",
                    wordWrap: "break-word",
                  }}
                >
                  {cleanedMessage}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your question...(suggest improvements in the essay)"
          rows={3}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 5,
            border: "1px solid #ccc",
            resize: "vertical",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: 10,
            borderRadius: 5,
            color: "#fff",
            backgroundColor: "#2196F3",
            cursor: "pointer",
            border: "none",
            minWidth: 80,
          }}
        >
          Send
        </button>
      </div>
    </div>
  </div>
);


};

export default ChatbotTrainerUI;
