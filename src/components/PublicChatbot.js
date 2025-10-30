import React, { useState, useEffect, useRef } from "react";
import "./PublicChatbot.css";

export default function PublicChatbot({ doctorData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const chatEndRef = useRef(null);

  const server = "https://generalchatbot-production.up.railway.app";

  // ---------------- Logs for debugging ----------------
  useEffect(() => {
    console.log("🚦 PublicChatbot mounted");
    console.log("doctorData on mount:", doctorData);
  }, []);

  // ---------------- Welcome message ----------------
  useEffect(() => {
    if (doctorData?.name) {
      console.log("👨‍⚕️ doctorData available:", doctorData);
      const welcomeMsg = {
        sender: "bot",
        text: `Welcome, Dr. ${doctorData.name}! How can I assist you today?`,
      };
      setMessages([welcomeMsg]);
    }
  }, [doctorData?.name]);

  // ---------------- Auto-scroll ----------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  // ---------------- Send message ----------------
  const sendMessage = async () => {
    if (!input.trim() || !doctorData?.id) {
      console.warn("🚨 Cannot send message: doctorData.id missing");
      return;
    }

    const msg = input.trim();
    setMessages((prev) => [...prev, { text: msg, sender: "user" }]);
    setInput("");
    setIsWaiting(true);

    try {
      console.log("🌐 Sending message to backend:", msg);
      const res = await fetch(`${server}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, user_id: doctorData.id }),
      });

      const data = await res.json();
      console.log("📦 Backend response:", data);

      setMessages((prev) => [
        ...prev,
        { text: data.reply ?? "No response", sender: "bot" },
      ]);
    } catch (err) {
      console.error("❌ Error fetching chatbot response:", err);
      setMessages((prev) => [...prev, { text: "Service unavailable", sender: "bot" }]);
    } finally {
      setIsWaiting(false);
    }
  };

  // ---------------- Loading state ----------------
  if (!doctorData) {
    return (
      <div className="chat-container">
        <div className="chat-box">
          <div className="chat-header">Gem AI</div>
          <div className="chat-messages">
            <div className="chat-bubble bot">Loading chatbot...</div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- Render full chat ----------------
  return (
    <div className="chat-container">
      <div className="chat-box">
        <div className="chat-header">Gem AI</div>

        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.sender === "user" ? "user" : "bot"}`}>
              {m.text}
            </div>
          ))}
          {isWaiting && (
            <div className="chat-bubble bot waiting">
              <span>Waiting for response...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
          />
          <button className="btn primary" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
