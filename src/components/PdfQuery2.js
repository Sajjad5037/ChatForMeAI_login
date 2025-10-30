import React, { useState } from 'react';


// Dummy ModelTrainingAlert component (replace with your own)
const ModelTrainingAlert = ({ message }) => (
  <div style={{ marginTop: '10px', color: 'red', fontWeight: 'bold' }}>
    {message}
  </div>
); 

const ChatbotWithPdfTraining2 = () => {
  // States
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const username = "Website"; // example, or get it dynamically
  const [isTrainDisabled, setIsTrainDisabled] = useState(false);
  const [isRemoveTrainingDisable, setisRemoveTrainingDisable] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
  {
    sender: 'Developer',
    text: 'Note: Instructions to make full use of this app:\n1. Choose your PDF\n2. Click "Train Model"\n3. Ask questions'
  }
]);

  const [userInput, setUserInput] = useState('');
  const [placeholderText, setPlaceholderText] = useState('Enter your input here');
  const [isTextAreaDisabled, setisTextAreaDisabled] = useState(true);
  const [isSentDisabled, setIsSentDisabled] = useState(false);
  
  const [isContextDisable, setisContextDisable] = useState(true);

  
  const handleFileUpload = (e) => {
  const files = Array.from(e.target.files); // Keep actual File objects
  setPdfFiles(prevFiles => [...prevFiles, ...files]);
};

  const handleTrainModelNew = async () => {
  if (pdfFiles.length === 0) {
    setAlertMessage("No PDFs selected to train.");
    return;
  }

  setAlertMessage("Uploading PDFs...");
  setIsTrainDisabled(true); // Disable the button while uploading

  try {
    // Step 1: Upload PDFs
    const formData = new FormData();
    pdfFiles.forEach((file) => {
      formData.append("pdfs", file);
    });

    const uploadResponse = await fetch(
      "https://usefulapis-production.up.railway.app/api/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    setAlertMessage("Upload successful! Starting training...");

    // Step 2: Trigger training with JSON body matching PageRange model
    const trainResponse = await fetch(
      "https://usefulapis-production.up.railway.app/api/train_model_full_pdf_read",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_page: 3, // adjust as needed
          end_page: 9,   // adjust as needed
          user_name: "Website" // can be dynamic if you have login
        }),
      }
    );

    if (!trainResponse.ok) {
      const errorData = await trainResponse.json();
      throw new Error(
        `Training failed: ${trainResponse.status} ${errorData.detail || errorData.error}`
      );
    }

    setAlertMessage("Training completed successfully!");
    setIsTrainDisabled(false);
    setisRemoveTrainingDisable(false);
    setisTextAreaDisabled(false);
    setIsSentDisabled(false);
    setisContextDisable(false);
  } catch (error) {
    console.error(error);
    setAlertMessage(`Error: ${error.message}`);
    setIsTrainDisabled(false);
  }
};


  const handleChatSubmit = async () => {
  if (!userInput.trim()) return;

  // Add user message immediately
  setChatMessages(prev => [...prev, { sender: 'user', text: userInput }]);

  try {
    // Send user input to backend API
    const response = await fetch('https://usefulapis-production.up.railway.app/api/full_pdf_chatbot', {  // replace '/api/chatbot' with your backend endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userInput, user_name: username }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    // Add bot reply from backend
    
    setChatMessages(prev => [
  ...prev,
  { sender: 'bot', text: data.reply },
  {sender:'bot', text:"****"},
  { sender: 'bot', text: `The model used the following context from your given PDF to answer your query:\n\n` },  
  { sender: 'bot', text: data.relevant_texts },
  { sender: 'bot', text: "If you are not satisfied with the working of the pdf then you can send your complaint at proactive1.san@gmail.com. Your precious feedback will be appreciated." },
  {sender:'bot', text:"****"}
]);
    

  } catch (error) {
    // Optionally show error message from backend or a generic error
    setChatMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, something went wrong.' }]);
    console.error('Chatbot backend error:', error);
  }

  // Clear input field
  setUserInput('');
};

  const openPdfWithHighlight = () => {
    alert('Show context feature is not implemented yet.');
  };

  return (
  <div style={{
    display: 'flex',
    width: '100%',
    height: '100vh',
    padding: '24px',
    boxSizing: 'border-box',
    gap: '24px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    backgroundColor: '#f4f6f8'
  }}>
    {/* === Left Panel: PDF Upload === */}
    <div style={{
      flex: '0 0 320px',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
      height: '100%',
      gap: '14px'
    }}>
      <h3 style={{
        textAlign: 'center',
        color: '#1E293B',
        fontSize: '1.25rem',
        fontWeight: 600
      }}>
        Upload PDFs to Train the Chatbot
      </h3>

      <select
        size={10}
        style={{
          width: '100%',
          flex: '1',
          padding: '10px',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          overflowY: 'auto',
          fontSize: '0.95rem',
          color: '#334155'
        }}
        value={selectedFile}
        onChange={(e) => setSelectedFile(e.target.value)}
      >
        {pdfFiles.map((file, index) => (
          <option key={index} value={file.name}>{file.name}</option>
        ))}
      </select>

      <label htmlFor="fileInput" style={{
        padding: '12px 20px',
        backgroundColor: '#2563EB',
        color: '#fff',
        borderRadius: '8px',
        cursor: 'pointer',
        textAlign: 'center',
        fontWeight: 500,
        transition: 'background-color 0.3s ease, transform 0.2s ease'
      }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
      >
        Choose PDF
      </label>

      <input
        id="fileInput"
        type="file"
        accept="application/pdf"
        multiple
        onChange={(e) => {
          handleFileUpload(e);
          setIsTrainDisabled(false);
          setisRemoveTrainingDisable(false);
        }}
        style={{ display: 'none' }}
      />

      <button
        onClick={() => {
          setPlaceholderText("Train the model to enable this...");
          setisTextAreaDisabled(true);
          setPdfFiles([]);
          setIsTrainDisabled(false);
          setisRemoveTrainingDisable(true);
          setChatMessages([]);
          setAlertMessage('');
        }}
        style={{
          padding: '10px',
          borderRadius: '8px',
          color: '#fff',
          backgroundColor: '#EF4444',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'background-color 0.3s ease, transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
      >
        Remove
      </button>

      <button
        onClick={handleTrainModelNew}
        style={{
          padding: '10px',
          borderRadius: '8px',
          color: '#fff',
          backgroundColor: isTrainDisabled ? '#CBD5E1' : '#22C55E',
          fontWeight: 500,
          cursor: isTrainDisabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s ease, transform 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!isTrainDisabled) e.currentTarget.style.backgroundColor = '#16A34A';
        }}
        onMouseLeave={(e) => {
          if (!isTrainDisabled) e.currentTarget.style.backgroundColor = '#22C55E';
        }}
      >
        Train Model
      </button>

      {alertMessage && <ModelTrainingAlert message={alertMessage} />}
    </div>

    {/* === Right Panel: Chat Interface === */}
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
      height: '100%',
      gap: '14px'
    }}>
      <h3 style={{
        textAlign: 'center',
        color: '#1E293B',
        fontSize: '1.25rem',
        fontWeight: 600
      }}>
        Virtual Chatbot Assistant
      </h3>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC'
        }}
        className="chat-container"
      >
        {chatMessages.map((msg, index) => (
          <div key={index} style={{
            marginBottom: '12px',
            textAlign: msg.sender === 'user' ? 'right' : 'left',
          }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: msg.sender === 'user' ? '#DCFCE7' : '#E2E8F0',
              padding: '10px 14px',
              borderRadius: msg.sender === 'user'
                ? '16px 16px 0 16px'
                : '16px 16px 16px 0',
              color: '#1E293B',
              maxWidth: '80%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #CBD5E1',
        borderRadius: '30px',
        padding: '8px 10px',
        backgroundColor: '#fff',
        gap: '8px'
      }}>
        <textarea
          value={userInput}
          onChange={(e) => {
            setUserInput(e.target.value);
            setIsSentDisabled(e.target.value.trim() === '');
          }}
          placeholder={placeholderText}
          disabled={isTextAreaDisabled}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '0.95rem',
            backgroundColor: 'transparent'
          }}
          rows={2}
        />
        <button
          onClick={handleChatSubmit}
          disabled={isSentDisabled}
          style={{
            padding: '10px 18px',
            borderRadius: '25px',
            color: '#fff',
            fontWeight: 500,
            border: 'none',
            backgroundColor: isSentDisabled ? '#CBD5E1' : '#2563EB',
            cursor: isSentDisabled ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s ease, transform 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isSentDisabled) e.currentTarget.style.backgroundColor = '#1D4ED8';
          }}
          onMouseLeave={(e) => {
            if (!isSentDisabled) e.currentTarget.style.backgroundColor = '#2563EB';
          }}
        >
          Send
        </button>
      </div>
    </div>
  </div>
);



};

export default ChatbotWithPdfTraining2; 