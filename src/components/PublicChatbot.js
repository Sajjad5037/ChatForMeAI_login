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

  // ---------------- Extract session token from URL ----------------
  const queryParams = new URLSearchParams(window.location.search);
  const sessionToken = queryParams.get("sessionToken");

  // ---------------- Step 1: Fetch doctor username using session token ----------------
  useEffect(() => {
    if (!sessionToken) return;

    const fetchDoctorUsername = async () => {
      try {
        const res = await fetch(
          `${backendUrl}/get-doctor-username?session_token=${sessionToken}`
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        console.log("📦 Doctor username fetched:", data);
        setDoctorUsername(data.username);
      } catch (err) {
        console.error("❌ Error fetching doctor username:", err);
      }
    };

    fetchDoctorUsername();
  }, [sessionToken]);

  // ---------------- Step 2: Fetch doctor ID using username ----------------
  useEffect(() => {
    if (!doctorUsername) return;

    const fetchDoctorId = async () => {
      try {
        const res = await fetch(
          `${backendUrl}/get-doctor-id?username=${encodeURIComponent(doctorUsername)}`
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        console.log("📦 Doctor ID fetched:", data);
        setDoctorId(data.doctor_id);
      } catch (err) {
        console.error("❌ Error fetching doctor ID:", err);
      }
    };

    fetchDoctorId();
  }, [doctorUsername]);

  // ---------------- Step 3: Add welcome message ----------------
  useEffect(() => {
    if (doctorUsername) {
      const welcomeMsg = {
        sender: "bot",
        text: `Welcome, Dr. ${doctorUsername}! How can I assist you today?`,
      };
      setMessages([welcomeMsg]);
    }
  }, [doctorUsername]);

  // ---------------- Auto-scroll chat ----------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  // ---------------- Send message to chatbot ----------------
  const sendMessage = async () => {
    if (!input.trim() || !doctorId) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, sender: "user" }]);
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

      setMessages(prev => [
        ...prev,
        { text: data.reply ?? "No response", sender: "bot" },
      ]);
    } catch (err) {
      console.error("❌ Error sending message to chatbot:", err);
      setMessages(prev => [
        ...prev,
        { text: "Service unavailable", sender: "bot" },
      ]);
    } finally {
      setIsWaiting(false);
    }
  };

  // ---------------- Loading state ----------------
  if (!sessionToken || !doctorUsername || !doctorId) {
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
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
          />
          <button className="btn primary" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
