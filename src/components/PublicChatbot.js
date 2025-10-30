import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./PublicChatbot.css";

export default function PublicChatbot({ doctorData }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const publicToken = queryParams.get("publicToken");
  const sessionToken = queryParams.get("sessionToken");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const chatEndRef = useRef(null);

  const server = "https://generalchatbot-production.up.railway.app";

  // ------------------ Initial welcome ------------------
  useEffect(() => {
    const welcomeMsg = {
      sender: "bot",
      text: `Hello! Welcome to our AI chat service.`,
    };
    setMessages([welcomeMsg]);
  }, []);

  // ------------------ Auto-scroll ------------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  // ------------------ Send message ------------------
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!input.trim()) return;

  const userInput = input.trim();
  setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
  setInput("");
  setIsWaiting(true);

  try {
    const res = await fetch(`${server}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userInput,
        user_id: doctorData?.id,  // send user_id for backend
      }),
    });

    const data = await res.json();
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: data.reply ?? "No response" },
    ]);
  } catch (err) {
    console.error("Error fetching chatbot response:", err);
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Service unavailable" },
    ]);
  } finally {
    setIsWaiting(false);
  }
};

  return (
    <div className="chatbot-fullscreen">
      <div className="chatbot-container">
        <div className="chatbot-header"> Your Virtual Assistant</div>

        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chatbot-message ${msg.sender === "user" ? "user" : "bot"}`}
            >
              {msg.text}
            </div>
          ))}
          {isWaiting && (
            <div className="chatbot-message bot waiting">
              <div className="spinner"></div>
              <span>Waiting for response...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form className="chatbot-input-area" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Type your query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}
