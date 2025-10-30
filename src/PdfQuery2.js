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
    text: 'Note: The model is trained on page 3 to page 9 of your given PDF.\n\nInstructions to make full use of this app:\n1. Choose your PDF\n2. Click "Train Model"\n3. Ask questions'
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
      "https://usefulapis-production.up.railway.app/api/train_model_website_pdf",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_page: 3, // adjust as needed
          end_page: 9,   // adjust as needed
          user_name: "website" // can be dynamic if you have login
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
    const response = await fetch('https://usefulapis-production.up.railway.app/api/pdf_chatbot', {  // replace '/api/chatbot' with your backend endpoint
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
          
        </div>
      </div>
    </div>
  );
};

export default ChatbotWithPdfTraining2; 