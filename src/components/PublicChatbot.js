import React, { useState, useEffect, useRef } from "react";
import "./PublicChatbot.css";

export default function PublicChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [doctorName, setDoctorName] = useState(""); // will fetch using session token
  const chatEndRef = useRef(null);

  const server = "https://generalchatbot-production.up.railway.app";
  const backendUrl = "https://web-production-e5ae.up.railway.app";

  // ---------------- Extract session token from URL ----------------
  const queryParams = new URLSearchParams(window.location.search);
  const sessionToken = queryParams.get("sessionToken");

  useEffect(() => {
    console.log("🚦 PublicChatbot mounted");
    console.log("sessionToken:", sessionToken);

    if (!sessionToken) {
      console.warn("🚨 No session token found in URL");
      return;
    }

    // Fetch doctor info from backend using session token
    const fetchDoctorInfo = async () => {
      try {
        const res = await fetch(`${backendUrl}/get-doctor-name?session_token=${sessionToken}`);
        const data = await res.json();
        console.log("📦 Doctor info fetched:", data);
        setDoctorName(data.name);
      } catch (err) {
        console.error("❌ Error fetching doctor info:", err);
      }
    };

    fetchDoctorInfo();
  }, [sessionToken]);

  // ---------------- Welcome message ----------------
  useEffect(() => {
    if (doctorName) {
      const welcomeMsg = {
        sender: "bot",
        text: `Welcome, Dr. ${doctorName}! How can I assist you today?`,
      };
      setMessages([welcomeMsg]);
    }
  }, [doctorName]);

  // ---------------- Auto-scroll ----------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  // ---------------- Send message ----------------
  const sendMessage = async () => {
    if (!input.trim() || !sessionToken) {
      console.warn("🚨 Cannot send message: missing input or session token");
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
        body: JSON.stringify({ message: msg, session_token: sessionToken }),
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
  if (!sessionToken || !doctorName) {
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
