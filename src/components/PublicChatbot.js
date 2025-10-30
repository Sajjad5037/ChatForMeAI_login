import React, { useState, useEffect, useRef } from "react";
import "./PublicChatbot.css"; // make sure you have a CSS file for full chat styles

export default function PublicChatbot({ doctorData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const chatEndRef = useRef(null);

  // Log doctorData on first render
  useEffect(() => {
    console.log("DEBUG: doctorData:", doctorData);
  }, []);

  // Optional: welcome message
  useEffect(() => {
    if (doctorData?.name) {
      const welcomeMsg = {
        sender: "bot",
        text: `Welcome, Dr. ${doctorData.name}! How can I assist you today?`,
      };
      setMessages([welcomeMsg]);
    }
  }, [doctorData?.name]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  const sendMessage = async () => {
  if (!input.trim()) return;
  if (!doctorData?.id) {
    console.error("🚨 Doctor ID missing, cannot send message");
    return;
  }

  const msg = input.trim();
  setMessages((prev) => [...prev, { text: msg, sender: "user" }]);
  setInput("");
  setIsWaiting(true);

  try {
    const response = await fetch(
      "https://generalchatbot-production.up.railway.app/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          user_id: doctorData.id, // must match backend's user_id
        }),
      }
    );

    if (!response.ok) {
      console.error(`🚨 Backend returned status ${response.status}`);
      setMessages((prev) => [
        ...prev,
        { text: "Service unavailable", sender: "bot" },
      ]);
      return;
    }

    const data = await response.json();
    console.log("💬 Bot response:", data);

    setMessages((prev) => [
      ...prev,
      { text: data.reply ?? "No response", sender: "bot" },
    ]);
  } catch (err) {
    console.error("🚨 Error sending message:", err);
    setMessages((prev) => [
      ...prev,
      { text: "Service unavailable", sender: "bot" },
    ]);
  } finally {
    setIsWaiting(false);
  }
};

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
          <button className="btn primary" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}
