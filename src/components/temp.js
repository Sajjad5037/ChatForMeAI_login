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
  const [pendingSuggestions, setPendingSuggestions] = useState([]);

  
  const API_BASE = "https://usefulapis-production.up.railway.app";
                    
  // Fetch phase 2 & 3 data hooks (empty until backend implemented)
  useEffect(() => {
    if (tab === "approvals") {
      fetch(`${API_BASE}/queue/posts?user_id=${doctorData.id}`)
        .then(res => res.json())
        .then(data => {
          console.log("DEBUG: approvals from backend:", data); // 👈 debug log
          setApprovals(data);
        })
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

  useEffect(() => {
  if (tab === "approvals" && campaignId) {
    fetchPendingSuggestions(campaignId);
  }
}, [tab, campaignId]);
  
  const handleApproveSuggestion = async (suggestionId) => {
    try {
      const response = await fetch(`${API_BASE}/suggestions/${suggestionId}/approve`, { method: "POST" });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      
      // Optimistically remove the approved suggestion from state
      setPendingSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      
    } catch (err) {
      console.error(err);
      alert("Failed to approve suggestion.");
    }
  };

const handleRejectSuggestion = async (suggestionId) => {
  try {
    const response = await fetch(`${API_BASE}/suggestions/${suggestionId}/reject`, { method: "POST" });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    
    // Optimistically remove the rejected suggestion from state
    setPendingSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    
  } catch (err) {
    console.error(err);
    alert("Failed to reject suggestion.");
  }
};


  
  const fetchPendingSuggestions = async (campaignId) => {
  try {
    const response = await fetch(`${API_BASE}/campaigns/${campaignId}/suggestions/pending`);
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const data = await response.json();
    setPendingSuggestions(data); // set state to render in the approvals tab
  } catch (err) {
    console.error(err);
    alert("Failed to fetch pending suggestions.");
  }
};

  const saveSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: "POST", // or PATCH
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsData),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      alert("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving settings.");
    }
  };

  const handleApprove = async (suggestionId) => {
  try {
    const res = await fetch(`${API_BASE}/suggestions/${suggestionId}/approve`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    setApprovals(prev => prev.filter(a => a.id !== suggestionId));
  } catch (err) {
    console.error(err);
    alert("Failed to approve suggestion.");
  }
};

  

const handleReject = async (postId) => {
  try {
    const res = await fetch(`${API_BASE}/queue/posts/${postId}/reject`, { method: "POST" });
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    // Remove the rejected post from the local approvals state
    setApprovals(prev => prev.filter(a => a.id !== postId));
  } catch (err) {
    console.error(err);
    alert("Failed to reject post.");
  }
};


  
  const handleGenerate = async () => {
  if (!campaignName || !goal) {
    alert("Please fill out all fields.");
    return;
  }

  setLoading(true);

  try {
    // Only pick id and name from doctorData
    const doctorInfo = {
      id: doctorData.id,
      name: doctorData.name,
    };

    const response = await fetch(`${API_BASE}/generate-campaign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignName,
        goal,
        tone,
        doctorData: doctorInfo,
      }),
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);

    const data = await response.json();

    // ✅ Now only save campaignId (no suggestions here anymore)
    setCampaignId(data.campaign_id);

    // ✅ Show success message instead of rendering suggestions
    alert("Campaign generated successfully! Please check the Approval tab to review suggestions.");

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
      const filteredApprovals = approvals;

    
      return (
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Pending Approvals</h2>
    
          {/* Filter Buttons for Posts/Replies */}
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
    
          {/* Posts/Replies Approval Items */}
          {filteredApprovals.length === 0 ? (
            <p>No posts or replies waiting for approval.</p>
          ) : (
            filteredApprovals.map(a => (
              <div key={a.id} className="p-3 border rounded mb-2 flex justify-between items-center">
                <span>{a.content}</span>
                <div>
                  <button
                    className="w-24 px-3 py-1 bg-green-500 text-white rounded mr-2"
                    onClick={() => handleApprove(a.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="w-24 px-3 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleReject(a.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
    
          {/* AI-Generated Suggestions */}
          <h3 className="text-xl font-semibold mt-6 mb-2">AI-Generated Suggestions</h3>
          {pendingSuggestions.length === 0 ? (
            <p>No AI suggestions pending approval.</p>
          ) : (
            pendingSuggestions.map(s => (
              <div key={s.id} className="p-3 border rounded mb-2 flex justify-between items-center">
                <span>{s.content}</span>
                <div>
                  <button
                    className="px-3 py-1 bg-green-500 text-white rounded mr-2"
                    onClick={() => handleApproveSuggestion(s.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleRejectSuggestion(s.id)}
                  >
                    Reject
                  </button>
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
          {scheduled.length === 0 ? (
            <p>No scheduled posts.</p>
          ) : (
            scheduled.map((s) => (
              <div key={s.id} className="p-3 border rounded mb-4">
                <p className="mb-2">{s.content}</p>
    
                {/* AI suggested time */}
                <div className="mb-2">
                  <label className="block text-gray-600 mb-1">AI Suggested Time:</label>
                  <input
                    type="datetime-local"
                    value={s.aiSuggestedTime || ""}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                </div>
    
                {/* User override time */}
                <div className="mb-2">
                  <label className="block text-gray-600 mb-1">Your Scheduled Time:</label>
                  <input
                    type="datetime-local"
                    value={s.userScheduledTime || ""}
                    onChange={(e) => {
                      const newTime = e.target.value;
                      setScheduled((prev) =>
                        prev.map((post) =>
                          post.id === s.id ? { ...post, userScheduledTime: newTime } : post
                        )
                      );
                    }}
                    className="w-full p-2 border rounded"
                  />
                </div>
    
                {/* Confirmation */}
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => alert(`Post scheduled at ${s.userScheduledTime || s.aiSuggestedTime}`)}
                >
                  Confirm Schedule
                </button>
              </div>
            ))
          )}
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
          <div className="p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Settings</h2>
      
            {/* Campaign Defaults */}
            <div className="mb-6 p-4 border rounded bg-white shadow">
              <h3 className="text-lg font-semibold mb-2">Campaign Defaults</h3>
              <label className="block text-gray-600 mb-1">Default Tone:</label>
              <select
                value={settingsData.defaultTone || "Casual"}
                onChange={(e) =>
                  setSettingsData({ ...settingsData, defaultTone: e.target.value })
                }
                className="w-full p-2 border rounded mb-3"
              >
                <option>Casual</option>
                <option>Professional</option>
                <option>Inspirational</option>
                <option>Humorous</option>
              </select>
      
              <label className="block text-gray-600 mb-1">Default Goal:</label>
              <input
                type="text"
                value={settingsData.defaultGoal || ""}
                onChange={(e) =>
                  setSettingsData({ ...settingsData, defaultGoal: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="e.g., Engagement, Brand Awareness"
              />
            </div>
      
            {/* Posting Preferences */}
            <div className="mb-6 p-4 border rounded bg-white shadow">
              <h3 className="text-lg font-semibold mb-2">Posting Preferences</h3>
              <label className="block text-gray-600 mb-1">Preferred Days:</label>
              <input
                type="text"
                value={settingsData.postingPreferences?.preferredDays?.join(", ") || ""}
                onChange={(e) =>
                  setSettingsData({
                    ...settingsData,
                    postingPreferences: {
                      ...settingsData.postingPreferences,
                      preferredDays: e.target.value.split(",").map((d) => d.trim()),
                    },
                  })
                }
                className="w-full p-2 border rounded mb-3"
                placeholder="Monday, Wednesday, Friday"
              />
      
              <label className="block text-gray-600 mb-1">Preferred Hours:</label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={settingsData.postingPreferences?.preferredHours?.start || ""}
                  onChange={(e) =>
                    setSettingsData({
                      ...settingsData,
                      postingPreferences: {
                        ...settingsData.postingPreferences,
                        preferredHours: {
                          ...settingsData.postingPreferences.preferredHours,
                          start: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-1/2 p-2 border rounded"
                />
                <input
                  type="time"
                  value={settingsData.postingPreferences?.preferredHours?.end || ""}
                  onChange={(e) =>
                    setSettingsData({
                      ...settingsData,
                      postingPreferences: {
                        ...settingsData.postingPreferences,
                        preferredHours: {
                          ...settingsData.postingPreferences.preferredHours,
                          end: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-1/2 p-2 border rounded"
                />
              </div>
            </div>
      
            {/* Notifications */}
            <div className="mb-6 p-4 border rounded bg-white shadow">
              <h3 className="text-lg font-semibold mb-2">Notifications</h3>
              {["onApprovalNeeded", "onPostScheduled", "onPostPublished"].map((key) => (
                <label key={key} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={settingsData.notifications?.[key] || false}
                    onChange={(e) =>
                      setSettingsData({
                        ...settingsData,
                        notifications: { ...settingsData.notifications, [key]: e.target.checked },
                      })
                    }
                  />
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
              ))}
            </div>
      
            {/* AI Preferences */}
            <div className="mb-6 p-4 border rounded bg-white shadow">
              <h3 className="text-lg font-semibold mb-2">AI Preferences</h3>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={settingsData.aiPreferences?.suggestOptimalTime || false}
                  onChange={(e) =>
                    setSettingsData({
                      ...settingsData,
                      aiPreferences: {
                        ...(settingsData.aiPreferences || {}),
                        suggestOptimalTime: e.target.checked,
                      },
                    })
                  }
                />
                Suggest Optimal Posting Time
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settingsData.aiPreferences?.allowAutoScheduling || false}
                  onChange={(e) =>
                    setSettingsData({
                      ...settingsData,
                      aiPreferences: {
                        ...settingsData.aiPreferences,
                        allowAutoScheduling: e.target.checked,
                      },
                    })
                  }
                />
                Allow AI to Auto-Schedule Posts
              </label>
            </div>
      
            {/* Save Button */}
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={saveSettings}
            >
              Save Settings
            </button>
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
