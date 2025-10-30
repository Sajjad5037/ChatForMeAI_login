// EssayDashboard.js
import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import axios from "axios";

const EssayDashboard = ({doctorData}) => {
  const [activeLink, setActiveLink] = useState("evaluator");
  const [accessAllowed, setAccessAllowed] = useState(null); // null = loading

  useEffect(() => {
    // Check user's access based on cost
    const checkAccess = async () => {
      try {
        const response = await axios.get(
          `https://usefulapis-production.up.railway.app/check-user-access?username=${doctorData.name}`
        );
        setAccessAllowed(response.data.access_allowed);
      } catch (error) {
        console.error("Failed to check access:", error);
        setAccessAllowed(false);
      }
    };

    checkAccess();
  }, [doctorData.name]);

  if (accessAllowed === null) {
    return <div>Loading dashboard...</div>;
  }

  if (!accessAllowed) {
    return (
      <div style={{ padding: "50px", textAlign: "center", fontSize: "18px", color: "#b91c1c" }}>
        ❌ Access Restricted: You have exceeded your allowed usage limit.
      </div>
    );
  }

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f7f9fc",
      margin: 0,
      color: "#333",
    },
    header: {
      backgroundColor: "#4e73df",
      color: "#fff",
      padding: "1rem 2rem",
      textAlign: "center",
      fontSize: "1.5rem",
      fontWeight: "bold",
    },
    navBar: {
      display: "flex",
      justifyContent: "center",
      backgroundColor: "#fff",
      borderBottom: "1px solid #ddd",
      padding: "0.5rem",
      gap: "1rem",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    navLink: (active) => ({
      padding: "0.75rem 1rem",
      textDecoration: "none",
      color: active ? "#fff" : "#333",
      backgroundColor: active ? "#4e73df" : "#f1f3f7",
      borderRadius: 5,
      cursor: "pointer",
      transition: "all 0.2s ease",
    }),
    mainContent: {
      flex: 1,
      backgroundColor: "#fff",
      padding: 20,
      borderRadius: 8,
      boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
      margin: 20,
      overflowY: "auto",
    },
  };

  return (
    <div
  style={{
    width: "100%",           // ✅ take full available width
    minHeight: "100vh",      // ✅ fill viewport height
    margin: 0,               // ✅ no outside spacing
    padding: "20px",         // ✅ controlled internal spacing
    boxSizing: "border-box", // ✅ prevent overflow due to padding
    fontFamily: "Arial, sans-serif",
    background: "#f0f4f8",   // ✅ light background for entire layout
    display: "flex",
    flexDirection: "column", // ✅ header → nav → main in vertical order
  }}
>
  <header style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "20px" }}>
    📝 Essay Evaluation Dashboard
  </header>

  {/* Horizontal Tabs */}
  <nav
    style={{
      display: "flex",
      gap: "15px",
      marginBottom: "20px",
      borderBottom: "1px solid #ccc",
      paddingBottom: "10px",
    }}
  >
    <Link
      to="/EssayChecker/evaluator"
      style={styles.navLink(activeLink === "evaluator")}
      onClick={() => setActiveLink("evaluator")}
    >
      📝 Essay Evaluator (Image)
    </Link>
    <Link
      to="/EssayChecker/reports"
      style={styles.navLink(activeLink === "reports")}
      onClick={() => setActiveLink("reports")}
    >
      📊 Common Mistake Reports
    </Link>
    <Link
      to="/EssayChecker/evaluator_pdf"
      style={styles.navLink(activeLink === "pdf")}
      onClick={() => setActiveLink("pdf")}
    >
      📄 Essay Evaluator (PDF)
    </Link>
  </nav>

  {/* Main Content */}
  <main
    style={{
      flex: 1,                // ✅ main content expands to fill space
      background: "#fff",
      borderRadius: "8px",
      padding: "20px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    }}
  >
    <Outlet />
  </main>
</div>

  );
};

export default EssayDashboard;
