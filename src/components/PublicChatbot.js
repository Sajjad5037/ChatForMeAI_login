import React, { useState, useEffect } from "react";
export default function PublicChatbot({ doctorData }) {
  // Now you can access doctorData inside this component
  // Example: doctorData.id, doctorData.name, etc.

  // Component state and logic here
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => setIsChatOpen((prev) => !prev);

  // Example sendMessage function using doctorData.id
  const sendMessage = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages((prev) => [...prev, { text: msg, sender: "user" }]);
    setInput("");

    try {
      const res = await fetch(`https://generalchatbot-production.up.railway.app/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, user_id: doctorData.id }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { text: data.reply ?? "No response", sender: "bot" }]);
    } catch (err) {
      console.error("Error fetching chatbot response:", err);
      setMessages((prev) => [...prev, { text: "Service unavailable", sender: "bot" }]);
    }
  };

  return (
    <>
      <button className="chat-toggle" onClick={toggleChat}>
        {isChatOpen ? "Close Chat" : "Chat with us"}
      </button>

      {isChatOpen && (
        <div className="chat-window">
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.sender === "user" ? "user" : "bot"}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              className="text-input"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
            />
            <button className="btn primary" onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
