// BottomTabNav.js
import "./BottomTabNav.css";
import { MdPeople, MdDashboard, MdNote, MdUploadFile, MdQrCode } from "react-icons/md";

export default function BottomTabNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <MdDashboard /> },
    { id: "patients", label: "Patients", icon: <MdPeople /> },
    { id: "notices", label: "Notices", icon: <MdNote /> },
    { id: "upload", label: "Upload", icon: <MdUploadFile /> },
    { id: "qr", label: "QR", icon: <MdQrCode /> },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            className={`nav-item ${isActive ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="icon">{tab.icon}</span>
            {isActive && <span className="label">{tab.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}
