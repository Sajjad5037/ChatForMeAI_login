import React, { useState, useEffect, useRef } from "react";
import "./PublicChatbot.css"; // Make sure your CSS handles centering & styling

export default function PublicChatbot({ doctorData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const chatEndRef = useRef(null);

  // Show loading until doctorData is available
  if (!doctorData) {
    return <div className="chat-loading">Loading chatbot...</div>;
  }

  // Welcome message when doctorData.name is available
  useEffect(() => {
    if (doctorData?.name) {
      const welcomeMsg = {
        sender: "bot",
        text: `Welcome, Dr. ${doctorData.name}! How can I assist you today?`,
      };
      setMessages([welcomeMsg]);
    }
  }, [doctorData?.name]);

  // Auto-scroll on new messages or waiting state
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  // Send message function
  const sendMessage = async () => {
    if (!input.trim() || !doctorData?.id) return;

    const msg = input.trim();
    setMessages((prev) => [...prev, { text: msg, sender: "user" }]);
    setInput("");
    setIsWaiting(true);

    try {
      const res = await fetch(
        `https://generalchatbot-production.up.railway.app/api/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg, user_id: doctorData.id }),
        }
      );

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { text: data.reply ?? "No response", sender: "bot" },
      ]);
    } catch (err) {
      console.error("Error fetching chatbot response:", err);
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
            <div
              key={i}
              className={`chat-bubble ${m.sender === "user" ? "user" : "bot"}`}
            >
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
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button className="btn primary" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
