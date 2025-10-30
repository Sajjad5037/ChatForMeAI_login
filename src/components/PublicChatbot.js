import { useState, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import "./DemoChatbot.css";

export default function DemoChatbot({ doctorData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [reasoningLevel, setReasoningLevel] = useState("simple");
  const [isWaiting, setIsWaiting] = useState(false);
  const chatEndRef = useRef(null);

   useEffect(() => {
    console.log("DEBUG: doctorData on first render:", doctorData);
  }, []); // empty dependency array → runs once after first render
  
  // ------------------ Welcome message ------------------
  useEffect(() => {
    console.log("👨‍⚕️ doctorData received:", doctorData);
    if (doctorData?.name) {
      const welcomeMsg = {
        sender: "bot",
        text: `Welcome, Dr. ${doctorData.name}! How can I assist you today?`,
        links: [],
      };
      console.log("💬 Setting initial message:", welcomeMsg);
      setMessages([welcomeMsg]);
    }
  }, [doctorData?.name]);

  // ------------------ Auto-scroll ------------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  if (!doctorData?.name) {
    console.warn("⚠️ doctorData.name missing — redirecting to login");
    return <Navigate to="/" replace />;
  }

  // ------------------ Parse **bold** text ------------------
  const parseBoldText = (text) => {
    const regex = /\*\*(.+?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex}>{text.slice(lastIndex, match.index)}</span>);
      }
      parts.push(<strong key={match.index}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
    }

    return parts;
  };
  // ------------------ Parse URLs in text ------------------
  const formatMessageWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(
      urlRegex,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );
  };


  // ------------------ Handle user submit ------------------
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!input.trim()) return;

  const userInput = input;
  console.log("🧍 User submitted:", userInput);

  // Add user message
  setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
  setInput("");
  setIsWaiting(true);

  try {
    // Backend request
    const url = `https://krishbackend-production.up.railway.app/search?query=${encodeURIComponent(
        userInput
    )}&reasoning=${encodeURIComponent(reasoningLevel)}&user_id=${encodeURIComponent(
        doctorData.name
    )}&class_name=${encodeURIComponent(doctorData.class_name)}`;
    console.log("🌐 Fetching backend with URL:", url);

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Backend returned status ${response.status}`);
    const data = await response.json();

    console.log("📦 Backend raw data:", data);

    // Process each item
    const processedMessages = data.map((item, idx) => {
      console.log(`🔹 Processing item ${idx}:`, item);
      console.log("   Name   :", item.name);
      console.log("   Snippet:", item.snippet);
      console.log("   Links  :", item.links);

      return {
        sender: "bot",
        text: item.snippet,
        name: item.name,
        links: Array.isArray(item.links) ? item.links : []
      };
    });

    console.log("✅ Final processed messages:", processedMessages);

    // Add bot messages
    setMessages((prev) => [...prev, ...processedMessages]);
  } catch (error) {
    console.error("❌ Error fetching from backend:", error);
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Sorry, something went wrong while fetching results.", links: [] }
    ]);
  } finally {
    setIsWaiting(false);
    console.log("⏹️ handleSubmit complete, isWaiting=false");
  }
};


  return (
    <div className="chat-container">
      <div className="chat-box">
        <div className="chat-header">Gem AI</div>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                {msg.sender === "bot" ? (
                  <>
                    {msg.name && (
                      <div className="bot-label">
                        {parseBoldText(msg.name)} {/* render name with bold parsing */}
                      </div>
                    )}
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formatMessageWithLinks(msg.text),
                      }}
                    ></div>

                    {Array.isArray(msg.links) && msg.links.length > 0 && (
                      <div className="pdf-links">
                        <a
                          href={msg.links[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pdf-link"
                        >
                          Open PDF
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <div>{msg.text}</div>
                )}

              </div>
            ))}
          
            {isWaiting && (
              <div className="message bot waiting">
                <div className="spinner"></div>
                <span>Waiting for response...</span>
              </div>
            )}
          
            <div ref={chatEndRef} />
          </div>

        
        <form
          onSubmit={handleSubmit}
          className="chat-input"
          style={{ display: "flex", gap: "8px", alignItems: "center" }}
        >
          <input
            type="text"
            placeholder="Type your query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ flex: 1, padding: "8px" }}
          />
          <div className="reasoning-container">
            <label htmlFor="reasoning-select" className="reasoning-label">
              Reasoning
            </label>
            <select
              id="reasoning-select"
              value={reasoningLevel}
              onChange={(e) => setReasoningLevel(e.target.value)}
              className="reasoning-select"
            >
              <option value="simple">Simple</option>
              <option value="medium">Medium</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <button type="submit" style={{ padding: "8px 16px" }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}








