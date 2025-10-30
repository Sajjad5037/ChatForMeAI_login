import { useState, useEffect } from "react";

export default function ApiUsage({ doctorData }) {
  const [usage, setUsage] = useState(null); // { used: 0, limit: 100 }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        setLoading(true);
        const response = await fetch(
          `https://your-backend.com/api/usage?doctorId=${doctorData.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch API usage");
        const data = await response.json();
        setUsage(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
  }, [doctorData.id]);

  if (loading) return <p>Loading API usage...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!usage) return null;

  const percentage = Math.min(
    100,
    Math.round((usage.used / usage.limit) * 100)
  );

  return (
    <div className="api-usage">
      <p>
        API Usage: {usage.used} / {usage.limit} ({percentage}%)
      </p>
      <div
        style={{
          backgroundColor: "#e0e0e0",
          borderRadius: "8px",
          height: "20px",
          width: "100%",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percentage}%`,
            backgroundColor: percentage > 80 ? "#f87171" : "#60a5fa", // red if near limit, else blue
            borderRadius: "8px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
