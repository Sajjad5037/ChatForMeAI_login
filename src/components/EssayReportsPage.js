import React, { useEffect, useState } from "react";

const EssayReportsPage = ({ doctorData }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);

      const token = doctorData?.session_token;
      const doctorName = doctorData?.name;

      console.log("Doctor session token:", token);
      console.log("Doctor name:", doctorName);
      console.log("Sending request to backend...");

      if (!token) {
        setError("No session token found. Cannot fetch reports.");
        setLoading(false);
        return;
      }

      if (!doctorName) {
        setError("Doctor name is missing. Cannot fetch reports.");
        setLoading(false);
        return;
      }

      try {
        // Use GET with query param
        const res = await fetch(
        `https://usefulapis-production.up.railway.app/css-common-mistakes?username=${encodeURIComponent(doctorName)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

        console.log("Fetch response:", res);

        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }

        const data = await res.json();
        console.log("Fetched data:", data);
        setReports(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [doctorData]);

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (reports.length === 0) return <p>No reports available.</p>;

  return (
    <div>
      <h2>📊 Common Mistake Patterns</h2>
      {reports.map((r) => (
        <div
          key={r.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <p>❌ Original: {r.original_text}</p>
          <p>✅ Corrected: {r.corrected_text}</p>
          <p>Category: {r.category}</p>
          <p>Explanation: {r.explanation}</p>
          <p>Date: {new Date(r.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default EssayReportsPage;
