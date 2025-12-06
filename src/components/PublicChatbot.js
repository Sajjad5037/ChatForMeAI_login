import React, { useState, useEffect, useRef } from "react";
import "./PublicChatbot.css";

export default function PublicChatbot({ publicToken, server2 }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [chatAccessToken, setChatAccessToken] = useState(null);

  const chatEndRef = useRef(null);

  const backendUrl = "https://web-production-e5ae.up.railway.app"; // for /api/chat-whatsapp

  // --------------------------------------------------------
  // STEP 1 — INIT: Check whether this chatbot requires password
  // --------------------------------------------------------
  useEffect(() => {
    const initChatbot = async () => {
      try {
        console.log("DEBUG: Calling chatbot init with publicToken:", publicToken);

        const res = await fetch(`https://web-production-e5ae.up.railway.app/chatbot/init/${publicToken}`);
        const data = await res.json();

        console.log("DEBUG: /chatbot/init response:", data);

        if (data.requiresPassword) {
          setRequiresPassword(true);
        } else {
          setRequiresPassword(false);
          setChatAccessToken("PUBLIC_ACCESS_GRANTED"); // no password needed
          setMessages([
            { sender: "bot", text: "Welcome! How can I assist you today?" },
          ]);
        }
      } catch (err) {
        console.error("❌ Error initializing chatbot:", err);
        setRequiresPassword(false);
      }
    };

    initChatbot();
  }, [publicToken, server2]);

  // --------------------------------------------------------
  // STEP 2 — HANDLE PASSWORD SUBMISSION
  // --------------------------------------------------------
  const submitPassword = async () => {
    try {
      console.log("DEBUG: Validating password");

      const res = await fetch(`https://web-production-e5ae.up.railway.app/chatbot/validate-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_token: publicToken,
          password: passwordInput,
        }),
      });

      const data = await res.json();
      console.log("DEBUG: /validate-password response:", data);

      if (!data.valid) {
        alert("Incorrect password");
        return;
      }

      setChatAccessToken(data.chatAccessToken);
      setMessages([
        { sender: "bot", text: "Access granted! How can I help you today?" },
      ]);
      setRequiresPassword(false);
    } catch (err) {
      console.error("❌ Error validating password:", err);
      alert("Password validation failed");
    }
  };

  // --------------------------------------------------------
  // STEP 3 — SEND MESSAGE TO EXISTING /api/chat-whatsapp BACKEND
  // --------------------------------------------------------
  const sendMessage = async () => {
    if (!input.trim() || !chatAccessToken) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setIsWaiting(true);

    try {
      console.log("DEBUG: Sending message to /api/rag-chat");

      const res = await fetch(`${backendUrl}/api/rag-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          public_token: publicToken,
          chat_access_token: chatAccessToken, // NEW
        }),
      });

      const data = await res.json();
      console.log("DEBUG: Chat response:", data);

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply ?? "No response received" },
      ]);
    } catch (err) {
      console.error("❌ Error sending message:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Service unavailable" },
      ]);
    } finally {
      setIsWaiting(false);
    }
  };

  // --------------------------------------------------------
  // SCROLL
  // --------------------------------------------------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  // --------------------------------------------------------
  // RENDER PASSWORD SCREEN
  // --------------------------------------------------------
  if (requiresPassword) {
    return (
      <div className="chat-wrapper">
        <div className="chat-container">
          <div className="chat-box">
            <div className="chat-header">Protected Chatbot</div>
            <div className="password-section">
              <p>This chatbot requires a password.</p>
              <input
                type="password"
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              <button className="btn primary" onClick={submitPassword}>
                Enter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // RENDER CHATBOT
  // --------------------------------------------------------
  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <div className="chat-box">
          <div className="chat-header">AI Chatbot</div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            ))}

            {isWaiting && (
              <div className="chat-bubble bot typing">Thinking...</div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
