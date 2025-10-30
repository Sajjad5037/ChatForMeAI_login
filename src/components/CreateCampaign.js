import React, { useState, useEffect } from "react";
import { Wand2, Rocket, Sparkles, Loader2, CheckCircle, XCircle, Inbox, ChartBar, Settings, Calendar } from "lucide-react";

function App({ doctorData }) {
  const [tab, setTab] = useState("dashboard");
  const [campaignName, setCampaignName] = useState("");
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState("Casual");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [campaignId, setCampaignId] = useState(null);
  const [approvalType, setApprovalType] = useState("post");
  const [approvals, setApprovals] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [settingsData, setSettingsData] = useState({});

  const API_BASE = "https://your-backend.up.railway.app";

  // Fetch phase 2 & 3 data hooks (empty until backend implemented)
  useEffect(() => {
    if (tab === "approvals") {
      fetch(`${API_BASE}/queue/posts`)
        .then(res => res.json())
        .then(data => setApprovals(data))
        .catch(() => setApprovals([]));
    }
    if (tab === "scheduled") {
      fetch(`${API_BASE}/scheduled`)
        .then(res => res.json())
        .then(data => setScheduled(data))
        .catch(() => setScheduled([]));
    }
    if (tab === "analytics") {
      fetch(`${API_BASE}/analytics/posts`)
        .then(res => res.json())
        .then(data => setAnalytics(data))
        .catch(() => setAnalytics([]));
    }
    if (tab === "inbox") {
      fetch(`${API_BASE}/inbox`)
        .then(res => res.json())
        .then(data => setInbox(data))
        .catch(() => setInbox([]));
    }
    if (tab === "settings") {
      fetch(`${API_BASE}/settings`)
        .then(res => res.json())
        .then(data => setSettingsData(data))
        .catch(() => setSettingsData({}));
    }
  }, [tab]);

  const handleGenerate = async () => {
    if (!campaignName || !goal) {
      alert("Please fill out all fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/generate-campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignName, goal, tone, doctorData }),
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setSuggestions(data.suggestions);
      setCampaignId(data.campaignId);
    } catch (err) {
      console.error(err);
      alert("Failed to generate campaign. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (tab) {
      case "dashboard":
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Welcome, {doctorData.name}!</h1>
            <p className="text-gray-700">Your AI social media campaign dashboard.</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="p-4 bg-white shadow rounded">Campaigns: {campaignId || "-"}</div>
              <div className="p-4 bg-white shadow rounded">Pending Approvals: {approvals.length}</div>
            </div>
          </div>
        );
      case "create":
        return (
          <div className="p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Create New Campaign</h2>
            <input
              type="text"
              placeholder="Campaign Name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full p-3 border rounded mb-3"
            />
            <textarea
              placeholder="Campaign Goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full p-3 border rounded mb-3"
            />
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-3 border rounded mb-3"
            >
              <option>Casual</option>
              <option>Professional</option>
              <option>Inspirational</option>
              <option>Humorous</option>
            </select>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded shadow hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate AI Suggestions"}
            </button>
            {suggestions.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-2">Suggestions:</h3>
                <ul className="list-disc pl-5">
                  {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        );
      case "approvals":
        const filteredApprovals = approvals.filter(a => a.type === approvalType);

        return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Pending Approvals</h2>
            {/* Filter Buttons */}
            <div className="flex gap-2 mb-4">
            <button
                onClick={() => setApprovalType("post")}
                className={`px-3 py-1 rounded ${approvalType === "post" ? "bg-blue-100" : "hover:bg-gray-100"}`}
            >
                Posts
            </button>
            <button
                onClick={() => setApprovalType("reply")}
                className={`px-3 py-1 rounded ${approvalType === "reply" ? "bg-blue-100" : "hover:bg-gray-100"}`}
            >
                Replies
            </button>
            </div>
            {/* Filtered Approval Items */}
            {filteredApprovals.length === 0 ? (
            <p>No items waiting for approval.</p>
            ) : (
            filteredApprovals.map(a => (
                <div key={a.id} className="p-3 border rounded mb-2 flex justify-between items-center">
                <span>{a.content}</span>
                <div>
                    <button className="px-3 py-1 bg-green-500 text-white rounded mr-2">Approve</button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded">Reject</button>
                </div>
                </div>
            ))
            )}
        </div>
        );
      case "scheduled":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Scheduled Posts</h2>
            {scheduled.length === 0 ? <p>No scheduled posts.</p> : scheduled.map(s => (
              <div key={s.id} className="p-3 border rounded mb-2">{s.content}</div>
            ))}
          </div>
        );
      case "analytics":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
            <p>Charts and metrics will appear here once backend is implemented.</p>
          </div>
        );
      case "inbox":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Inbox</h2>
            {inbox.length === 0 ? <p>No messages yet.</p> : inbox.map(m => (
              <div key={m.id} className="p-3 border rounded mb-2">{m.content}</div>
            ))}
          </div>
        );
      case "settings":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Settings</h2>
            <p>User and campaign settings will be here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex min-h-screen">
        <div className="w-64 bg-white shadow flex flex-col">
          <div className="p-6 font-bold text-xl">AI Social Campaign</div>
          <nav className="flex-1 px-2 space-y-1">
            <button onClick={() => setTab("dashboard")} className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center"><Rocket className="w-4 h-4 mr-2"/> Dashboard</button>
            <button onClick={() => setTab("create")} className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center"><Wand2 className="w-4 h-4 mr-2"/> Create Campaign</button>
            <button onClick={() => setTab("approvals")} className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center"><CheckCircle className="w-4 h-4 mr-2"/> Approvals</button>
            <button onClick={() => setTab("scheduled")} className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center"><Calendar className="w-4 h-4 mr-2"/> Scheduled</button>
            <button onClick={() => setTab("analytics")} className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center"><ChartBar className="w-4 h-4 mr-2"/> Analytics</button>
            <button onClick={() => setTab("inbox")} className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center"><Inbox className="w-4 h-4 mr-2"/> Inbox</button>
            <button onClick={() => setTab("settings")} className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center"><Settings className="w-4 h-4 mr-2"/> Settings</button>
          </nav>
        </div>
        {/* Content */}
        <div className="flex-1 bg-gray-50">{renderTabContent()}</div>
      </div>
    </div>
  );
}

export default App;
