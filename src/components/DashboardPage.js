import { useState, useEffect, useRef } from "react";
import BottomTabNav from "./BottomTabNav";
import KnowledgeBaseUpload_clinic from "./KnowledgeBaseUpload_clinic";
import ApiUsage from "./ApiUsage";
import "./NewDashboard.css";

export default function DashboardPage({ setIsLoggedIn, doctorData }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  // --- existing states (unchanged) ---
  const [doctorId, setDoctorId] = useState("");
  const [patients, setPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState("");
  const [newPatientName, setNewPatientName] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // your existing WebSocket, timers, effects etc. stay exactly as they were

  // logout
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // ------------------------------------------------------
  //  UI SECTIONS (each tab gets a compact card layout)
  // ------------------------------------------------------

  const DashboardTab = () => (
    <div className="tab-card">
      <h2>Overview</h2>
      <p><strong>Current Patient:</strong> {currentPatient || "None"}</p>
      <p><strong>Total Waiting:</strong> {patients.length}</p>
    </div>
  );

  const PatientsTab = () => (
    <div className="tab-card">
      <h2>Waiting List</h2>
      {patients.length === 0 && <p>No patients yet.</p>}
      <ul className="list">
        {patients.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>

      <input
        value={newPatientName}
        onChange={(e) => setNewPatientName(e.target.value)}
        placeholder="New client name"
        className="text-input"
      />
      <button className="btn primary">Add</button>
    </div>
  );

  const NoticesTab = () => (
    <div className="tab-card">
      <h2>Notice Board</h2>
      <ul className="list">
        {notices.map((n, i) => (
          <li key={i} className="notice-row">
            {n}
            <button className="btn small danger">X</button>
          </li>
        ))}
      </ul>

      <textarea
        rows={3}
        className="text-input"
        placeholder="Write a notice"
        value={newNotice}
        onChange={(e) => setNewNotice(e.target.value)}
      />
      <button className="btn primary">Add Notice</button>
    </div>
  );

  const UploadTab = () => (
    <div className="tab-card">
      <h2>Knowledge Base</h2>
      <KnowledgeBaseUpload_clinic doctorData={doctorData} />
    </div>
  );

  const QRTab = () => (
    <div className="tab-card">
      <h2>QR Code</h2>
      {qrCodeUrl ? (
        <img src={qrCodeUrl} alt="QR" className="qr-img" />
      ) : (
        <p>QR not ready</p>
      )}
    </div>
  );

  // which tab to render
  const renderTab = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab />;
      case "patients": return <PatientsTab />;
      case "notices": return <NoticesTab />;
      case "upload": return <UploadTab />;
      case "qr": return <QRTab />;
      default: return null;
    }
  };

  // ------------------------------------------------------

  return (
    <div className="page-container">
      <header className="top-bar">
        <h1>{doctorData?.name || "Dashboard"}</h1>
        <button className="btn logout" onClick={handleLogout}>Logout</button>
      </header>

      <main className="content">{renderTab()}</main>

      <BottomTabNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
