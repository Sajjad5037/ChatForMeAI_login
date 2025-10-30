import React, { useState } from "react";

export default function PublicChatbot({ doctorData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => setIsChatOpen((prev) => !prev);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages((prev) => [...prev, { text: msg, sender: "user" }]);
    setInput("");

    console.log("Sending message:", msg);

    if (!doctorData) {
      console.warn("doctorData is undefined!");
    } else {
      console.log("doctorData:", doctorData);
      console.log("doctorData.id:", doctorData.id);
    }

    if (!doctorData?.id) {
      console.error("User ID is missing! Cannot call backend.");
      setMessages((prev) => [
        ...prev,
        { text: "Error: User ID missing. Cannot send message.", sender: "bot" },
      ]);
      return;
    }

    try {
      const res = await fetch(`https://generalchatbot-production.up.railway.app/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, user_id: doctorData.id }),
      });
      const data = await res.json();
      console.log("Backend reply:", data.reply);
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
