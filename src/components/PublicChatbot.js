import React, { useState, useEffect, useRef } from "react";
import "./PublicChatbot.css";

export default function PublicChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [doctorUsername, setDoctorUsername] = useState("");
  const [doctorId, setDoctorId] = useState(null);
  const chatEndRef = useRef(null);

  const backendUrl = "https://web-production-e5ae.up.railway.app";
  const serverUrl = "https://generalchatbot-production.up.railway.app";

  // ---------------- Extract session token ----------------
  const queryParams = new URLSearchParams(window.location.search);
  const sessionToken = queryParams.get("sessionToken");

  // ---------------- Fetch doctor username ----------------
  useEffect(() => {
    if (!sessionToken) return;

    const fetchDoctorUsername = async () => {
      try {
        const res = await fetch(
          `${backendUrl}/get-doctor-username?session_token=${sessionToken}`
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setDoctorUsername(data.username);
      } catch (err) {
        console.error("❌ Error fetching doctor username:", err);
      }
    };

    fetchDoctorUsername();
  }, [sessionToken]);

  // ---------------- Fetch doctor ID ----------------
  useEffect(() => {
    if (!doctorUsername) return;

    const fetchDoctorId = async () => {
      try {
        const res = await fetch(
          `${backendUrl}/get-doctor-id?username=${encodeURIComponent(doctorUsername)}`
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setDoctorId(data.doctor_id);
      } catch (err) {
        console.error("❌ Error fetching doctor ID:", err);
      }
    };

    fetchDoctorId();
  }, [doctorUsername]);

  // ---------------- Add welcome message ----------------
  useEffect(() => {
    if (doctorUsername) {
      setMessages([
        {
          sender: "bot",
          text: `Welcome, Dr. ${doctorUsername}! How can I assist you today?`,
        },
      ]);
    }
  }, [doctorUsername]);

  // ---------------- Auto-scroll ----------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  // ---------------- Send message ----------------
  const sendMessage = async () => {
    if (!input.trim() || !doctorId) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { text: userMsg, sender: "user" }]);
    setInput("");
    setIsWaiting(true);

    try {
      const res = await fetch(`${serverUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, user_id: doctorId }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { text: data.reply ?? "No response", sender: "bot" },
      ]);
    } catch (err) {
      console.error("❌ Error sending message:", err);
      setMessages((prev) => [
        ...prev,
        { text: "Service unavailable", sender: "bot" },
      ]);
    } finally {
      setIsWaiting(false);
    }
  };

  // ---------------- Render ----------------
  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <div className="chat-box">
          <div className="chat-header">AI Chatbot</div>

          <div className="chat-messages">
            {/* Loading state or actual messages */}
            {!sessionToken || !doctorUsername || !doctorId ? (
              <div className="chat-bubble bot">Loading chatbot...</div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`chat-bubble ${msg.sender}`}>
                    {msg.text}
                  </div>
                ))}
                {isWaiting && (
                  <div className="chat-bubble bot waiting">
                    <span>Waiting for response...</span>
                  </div>
                )}
              </>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Type a message..."
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
    </div>
  );
}
