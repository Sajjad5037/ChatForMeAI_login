import { useState, useEffect } from "react";

export default function ApiUsage({ doctorData }) {
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const MONTHLY_LIMIT = 10; // USD

  useEffect(() => {
    async function fetchUsage() {
      try {
          setLoading(true);
          const response = await fetch(
            `https://web-production-e5ae.up.railway.app/api/usage?doctorId=${doctorData.id}`
          );
          if (!response.ok) throw new Error("Failed to fetch API usage");
          
          const data = await response.json();
          setUsageData(data);
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
  if (!usageData || usageData.length === 0)
    return <p>No usage recorded yet.</p>;

  // --- 💰 Compute total cost ---
  const totalCost = usageData.reduce((sum, entry) => sum + entry.cost_usd, 0);

  // --- % bar fill ---
  const percentage =
    MONTHLY_LIMIT > 0 ? Math.min(100, (totalCost / MONTHLY_LIMIT) * 100) : 0;

  return (
    <div className="api-usage">
      <p>
        API Usage Cost: ${totalCost.toFixed(4)} / ${MONTHLY_LIMIT} (
        {percentage.toFixed(2)}%)
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
            backgroundColor: percentage > 80 ? "#f87171" : "#60a5fa",
            borderRadius: "8px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
