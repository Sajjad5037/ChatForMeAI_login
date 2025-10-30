import React from "react";
import { Link, Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";

function EssayEvaluatorPage() {
  return (
    <div>
      <h2>📝 Essay Evaluator</h2>
      <p>Write or upload essays here to get evaluated automatically.</p>
    </div>
  );
}

function EssayReportsPage() {
  return (
    <div>
      <h2>📊 Essay Evaluation Reports</h2>
      <p>View reports and insights for all evaluated essays.</p>
    </div>
  );
}

function EssayDashboard({ isLoggedIn }) {
  const navigate = useNavigate();

  const handleEvaluatorClick = () => {
    navigate("/evaluator");
  };

  const handleReportsClick = () => {
    navigate("/reports");
  };

  const styles = {
    body: {
      margin: 0,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f7f9fc",
      color: "#333",
    },
    header: {
      backgroundColor: "#4e73df",
      color: "white",
      padding: "1rem 2rem",
      textAlign: "center",
      fontSize: "1.5rem",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    dashboardBody: {
      display: "flex",
      height: "calc(100vh - 80px)",
    },
    sidebar: {
      width: "240px",
      backgroundColor: "#fff",
      borderRight: "1px solid #ddd",
      padding: "1rem",
      boxShadow: "2px 0 6px rgba(0,0,0,0.03)",
    },
    navList: {
      listStyle: "none",
      padding: 0,
    },
    navLinkButton: {
      display: "block",
      width: "100%",
      padding: "0.75rem 1rem",
      marginBottom: "0.5rem",
      textAlign: "left",
      background: "#f1f3f7",
      border: "none",
      borderRadius: "5px",
      fontSize: "1rem",
      textDecoration: "none",
      color: "#333",
      transition: "background 0.3s ease",
      cursor: "pointer",
    },
    mainContent: {
      flex: 1,
      padding: "2rem",
      overflowY: "auto",
    },
    mainHeading: {
      fontSize: "1.5rem",
      color: "#4e73df",
      marginBottom: "0.5rem",
    },
    mainParagraph: {
      fontSize: "1rem",
      color: "#555",
    },
  };

  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  return (
    <div style={styles.body}>
      <header style={styles.header}>
        <h1>📝 Essay Evaluation Dashboard</h1>
      </header>
      <div style={styles.dashboardBody}>
        <nav style={styles.sidebar}>
          <ul style={styles.navList}>
            <li>
              <button onClick={handleEvaluatorClick} style={styles.navLinkButton}>
                📝 Essay Evaluator
              </button>
            </li>
            <li>
              <button onClick={handleReportsClick} style={styles.navLinkButton}>
                📊 Essay Evaluation Reports
              </button>
            </li>
          </ul>
        </nav>

        <main style={styles.mainContent}>
          <Routes>
            <Route path="/evaluator" element={<EssayEvaluatorPage />} />
            <Route path="/reports" element={<EssayReportsPage />} />
            <Route
              path="/"
              element={
                <>
                  <h2 style={styles.mainHeading}>Welcome!</h2>
                  <p style={styles.mainParagraph}>
                    Choose an option from the sidebar to start evaluating essays or view reports.
                  </p>
                </>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default EssayDashboard;
