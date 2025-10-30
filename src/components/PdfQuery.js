import React, { useState } from 'react';


// Dummy ModelTrainingAlert component (replace with your own)
const ModelTrainingAlert = ({ message }) => (
  <div style={{ marginTop: '10px', color: 'red', fontWeight: 'bold' }}>
    {message}
  </div>
); 
const ChatbotWithPdfTraining = ({ doctorData }) => {
  // States
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [isTrainDisabled, setIsTrainDisabled] = useState(false);
  const [isRemoveTrainingDisable, setisRemoveTrainingDisable] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
  {
    sender: 'Developer',
    text: 'Note: The model can be trained on any 25 pages of your given PDF.\n\nInstructions to make full use of this app:\n1. Choose your PDF\n2. Click "Train Model"\n3. Ask questions'
  }
]);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
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

    const range = endPage - startPage + 1;
    if (range > 30 || startPage <= 0 || endPage < startPage) {
      setAlertMessage("Invalid page range. Please select a range of up to 10 pages.");
      return;
    }

    setAlertMessage("Uploading PDFs...");
    setIsTrainDisabled(true);

    try {
      const formData = new FormData();
      pdfFiles.forEach((file) => {
        formData.append("pdfs", file);
      });
      formData.append("startPage", startPage);
      formData.append("endPage", endPage);

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

      const trainResponse = await fetch(
        "https://usefulapis-production.up.railway.app/api/train_model",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            start_page: startPage,
            end_page: endPage,
            user_name: doctorData.name,
          }),
        }
      );

      // ✅ Extract and show actual error from backend
      if (!trainResponse.ok) {
        const errorData = await trainResponse.json();
        const errorMessage = errorData.detail || errorData.error || "Training failed.";
        throw new Error(errorMessage);
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
    const response = await fetch('https://usefulapis-production.up.railway.app/api/pdf_chatbot', {  // replace '/api/chatbot' with your backend endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userInput,
        user_name: doctorData.name
      }),
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
  { sender: 'bot', text: "You can copy-paste each sentence(the part before the '.' ) from the context to highlight the part in your actual PDF." },
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
      justifyContent: 'space-between', 
      alignItems: 'flex-start', 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      gap: '20px'
    }}>
      {/* Left Section - PDF Upload */}
      <div style={{ 
        width: '300px', 
        padding: '20px', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px', 
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        height: '525px'
      }}>
        <h3 style={{ textAlign: 'center', color: '#333' }}>Upload PDFs to Train the Chatbot</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <div style={{ flex: 1, marginRight: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>Start Page</label>
            <input 
            type="number" 
            min="1" 
            value={startPage}
            onChange={(e) => setStartPage(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
        </div>
        <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>End Page</label>
            <input 
            type="number" 
            min="1" 
            value={endPage}
            onChange={(e) => setEndPage(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
        </div>
        </div>
        <select 
          size="10" 
          style={{ width: '100%', height: '275px', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' }}
          onChange={(e) => setSelectedFile(e.target.value)}
          value={selectedFile}
        >

          {pdfFiles.map((file, index) => (
            <option key={index} value={file.name}>{file.name}</option>
          ))}
        </select>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label 
            htmlFor="fileInput" 
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: '#fff',
              borderRadius: '5px',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            Choose PDF
          </label>
          <input 
            id="fileInput" 
            type="file" 
            accept="application/pdf" 
            onChange={(e) => { 
              handleFileUpload(e); 
              setIsTrainDisabled(false);
              setisRemoveTrainingDisable(false);
            }} 
            multiple 
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
                borderRadius: '5px', 
                color: '#fff', 
                backgroundColor: '#FF0000', 
                cursor: 'pointer',
                transition: 'transform 0.1s',
                userSelect: 'none'
            }}
          >
            Remove
          </button>

          <button               
            onClick={() => {                  
              handleTrainModelNew();
            }} 
            style={{ 
                padding: '10px', 
                borderRadius: '5px', 
                color: '#fff', 
                backgroundColor: isTrainDisabled ? '#ccc' : '#4CAF50',
                cursor: isTrainDisabled ? 'not-allowed' : 'pointer',
                transition: 'transform 0.1s',
                userSelect: 'none'
            }}
            //disabled={isTrainDisabled} for the time being because i am testing train model function
          >
            Train model
          </button>

          {alertMessage && <ModelTrainingAlert message={alertMessage} />}

          <button 
            onClick={() => { 
              setPdfFiles([]);
              setisTextAreaDisabled(true);
              setisRemoveTrainingDisable(true);
              setIsTrainDisabled(false);
              setChatMessages([]);
              alert('Previous training removed...');
            }} 
            style={{ 
              padding: '10px', 
              borderRadius: '5px', 
              color: '#fff', 
              backgroundColor: isRemoveTrainingDisable ? '#ccc' : '#FF0000',
              cursor: isRemoveTrainingDisable ? 'not-allowed' : 'pointer',
              transition: 'transform 0.1s',
              userSelect: 'none'
          }}
            disabled={isRemoveTrainingDisable}
          >
            Remove Previous training
          </button>
        </div>
      </div>

      {/* Right Section - Chatbot */}
      <div style={{ 
        flex: 1, 
        padding: '20px', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px', 
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        height: '525px'
      }}>
        <h3 style={{ textAlign: 'center', color: '#333' }}>Virtual Chatbot Assistant</h3>
        <div style={{
           height: '350px',
           overflowY: 'scroll',
           marginBottom: '15px',
           border: '1px solid #ddd',
           padding: '15px',                  
           borderRadius: '8px',
           backgroundColor: '#fff' 
        }}>
          {chatMessages.map((msg, index) => (
            <div key={index} style={{ marginBottom: '10px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
              <div style={{ display: 'inline-block', backgroundColor: '#f1f1f1', padding: '10px', borderRadius: '10px' }}>{msg.text}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
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
              borderRadius: '5px',
              border: '1px solid #ccc',
              marginRight: '10px',
              resize: 'vertical',
              overflowY: 'scroll'
            }}
            rows="3"
          />
          <button               
            onClick={() => {                  
              handleChatSubmit();
            }} 
            style={{ 
                padding: '10px', 
                borderRadius: '5px', 
                color: '#fff', 
                backgroundColor: isSentDisabled ? '#ccc' : '#2196F3',
                cursor: isSentDisabled ? 'not-allowed' : 'pointer',
                transition: 'transform 0.1s',
                userSelect: 'none'
            }}
            disabled={isSentDisabled}
          >
            Send
          </button>
          <button               
            onClick={() => {                  
              openPdfWithHighlight();
            }} 
            style={{ 
                padding: '10px', 
                borderRadius: '5px', 
                color: '#fff', 
                backgroundColor: isContextDisable ? '#ccc' : '#FF9800',
                cursor: isContextDisable ? 'not-allowed' : 'pointer',
                transition: 'transform 0.1s',
                userSelect: 'none'
            }}
            disabled={isContextDisable}
          >
            Show Context
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotWithPdfTraining;