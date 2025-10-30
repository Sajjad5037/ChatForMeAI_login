import React, { useState } from 'react';
import { marked } from 'marked';


const ChatbotTrainerUI_sociology = ({ doctorData }) => {
  
  const [pdfs, setPdfs] = useState([]);
  const [selectedPDFs, setSelectedPDFs] = useState([]);
  const [chatLog, setChatLog] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [sessionId, setSessionId] = React.useState(null);  // store sessionId in state
  const [marks, setMarks] = useState(0);
  const [question_text, setQuestionText] = useState("");
  const [minimumWordCount, setMinimumWordCount] = useState(80);



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
    const formData = new FormData();

    // Append each image
    images.forEach((img) => formData.append("images", img));

    // Append other form data
    formData.append("total_marks", marks);
    formData.append("question_text", question_text);
    formData.append("minimum_word_count", minimumWordCount);

    console.log("[DEBUG] Sending form data:", formData);

    const response = await fetch(
      "https://usefulapis-production.up.railway.app/train-on-images-anz-way-new",
      {
        method: "POST",
        body: formData,
        // credentials: "include"  // uncomment if you use cookies
      }
    );

    console.log("[DEBUG] Response received:", response);

    // Check if the network request failed
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[DEBUG] Response not OK:", response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    // Try parsing JSON
    let result;
    try {
      result = await response.json();
      console.log("[DEBUG] Parsed JSON result:", result);
    } catch (jsonErr) {
      const text = await response.text();
      console.error("[DEBUG] Failed to parse JSON:", text);
      throw new Error("Backend did not return valid JSON.");
    }

    // Check status from backend
    if (result.status !== "success") {
      alert(`❌ Evaluation failed: ${result.detail || "No detail provided"}`);
      return;
    }

    // Use evaluation_text from backend
    const evaluationText = result.evaluation_text;

    setChatLog((prev) => [
      ...prev,
      {
        type: "bot",
        message: (
          <div>
            <h3>Evaluation</h3>
            <div
              style={{
                background: "#f8f8f8",
                padding: "1em",
                borderRadius: "6px",
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
              }}
              dangerouslySetInnerHTML={{
                __html: evaluationText
                  .replace(/\*\*\s*(.*?)\s*\*\*/g, "<strong>$1</strong>")
                  .replace(/\n/g, "<br/>"),
              }}
            />
          </div>
        ),
      },
    ]);

    // Show summary info
    alert(`✅ Training successful!
📝 Total Marks: ${result.total_marks}
Minimum Word Count: ${result.minimum_word_count}
Student Response Length: ${result.student_response.length} characters`);

    // Optional: store session ID if returned
    if (result.session_id) {
      setSessionId(result.session_id);
    }

  } catch (error) {
    console.error("❌ Error during training:", error);
    alert(`Training failed. See console for details.`);
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
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: 20,
      fontFamily: 'Arial, sans-serif',
      gap: 20,
    }}
  >
    {/* Left Panel */}
    <div
      style={{
        width: 300,
        padding: 20,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        height: 525,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3 style={{ textAlign: 'center', color: '#333', marginBottom: 20 }}>
        Upload Image of your response
      </h3>

      <select
        multiple
        size={10}
        value={selectedImages.map(img => img.name)}
        onChange={handleImageSelect}
        style={{
          width: '100%',
          height: 300,
          padding: 10,
          marginBottom: 15,
          borderRadius: 5,
          border: '1px solid #ccc',
          flexShrink: 0,
          boxSizing: 'border-box',
        }}
      >
        {images.map((file, index) => (
        <option key={index} value={file.name}>
            {file.name}
        </option>
        ))}
      </select>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginTop: 'auto',
        }}
      >
        <label
          htmlFor="fileInput"
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            borderRadius: 5,
            cursor: 'pointer',
            textAlign: 'center',
            userSelect: 'none',
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
          style={{ display: 'none' }}
        />

        <button
          onClick={handleRemoveSelected}
          style={{
            padding: 10,
            borderRadius: 5,
            color: '#fff',
            backgroundColor: '#FF0000',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          Remove
        </button>

        <button
          onClick={handleTrain}
          style={{
            padding: 10,
            borderRadius: 5,
            color: '#fff',
            backgroundColor: '#4CAF50',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          Send your essay for checking...
        </button>
      </div>
    </div>

    {/* Right Panel */}
    <div
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        height: 525,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Marks input on the left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <label htmlFor="marksInput" style={{ fontWeight: 'bold', color: '#333' }}>Marks:</label>
            <input
            id="marksInput"
            type="number"
            min={0}
            style={{
                width: 60,
                padding: '5px 8px',
                borderRadius: 4,
                border: '1px solid #ccc',
            }}
            value={marks}
            onChange={(e) => setMarks(Number(e.target.value))}
            />
        </div>
        {/* Question input on the left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
        <label htmlFor="questionInput" style={{ fontWeight: 'bold', color: '#333' }}>Question:</label>
        <input
            id="questionInput"
            type="text"
            placeholder="Enter your question here"
            style={{
            flex: 1,               // take remaining space
            padding: '5px 8px',
            borderRadius: 4,
            border: '1px solid #ccc',
            }}
            value={question_text}
            onChange={(e) => setQuestionText(e.target.value)}
        />
        </div>
      

      <div
        style={{
          height: 450,
          overflowY: 'auto',
          marginBottom: 15,
          border: '1px solid #ddd',
          padding: 15,
          borderRadius: 8,
          backgroundColor: '#fff',
          flexShrink: 0,
          boxSizing: 'border-box',
        }}
      >
        {chatLog.map((msg, index) => {
  // Only call .replace if msg.message is a string
  let cleanedMessage = msg.message;
  if (msg.type === 'bot' && typeof msg.message === 'string') {
    cleanedMessage = msg.message
      .replace(/([^\.\?\!])\n/g, '$1 ') // Merge line breaks not after sentence endings
      .replace(/\n/g, '<br>'); // Convert remaining line breaks to <br> tags
  }

  return (
    <div
      key={index}
      style={{
        marginBottom: 10,
        textAlign: msg.type === 'user' ? 'right' : 'left',
      }}
    >
      {msg.type === 'bot' ? (
        typeof cleanedMessage === 'string' ? (
          <div
            style={{
              display: 'block',
              backgroundColor: '#f1f1f1',
              padding: 10,
              borderRadius: 10,
              maxWidth: '90%',
              wordWrap: 'break-word',
              lineHeight: 1.6,
            }}
            dangerouslySetInnerHTML={{ __html: marked.parse(cleanedMessage) }}
          />
        ) : (
          // If cleanedMessage is not a string, render as React element
          <div
            style={{
              display: 'block',
              backgroundColor: '#f1f1f1',
              padding: 10,
              borderRadius: 10,
              maxWidth: '90%',
              wordWrap: 'break-word',
              lineHeight: 1.6,
            }}
          >
            {cleanedMessage}
          </div>
        )
      ) : (
        <div
          style={{
            display: 'inline-block',
            backgroundColor: '#f1f1f1',
            padding: 10,
            borderRadius: 10,
            maxWidth: '70%',
            wordWrap: 'break-word',
          }}
        >
          {cleanedMessage}
        </div>
      )}
    </div>
  );
})}

      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        
      </div>
    </div>
  </div>
);
};

export default ChatbotTrainerUI_sociology;
