import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function CreateCampaign({ userData }) {
  const [campaignName, setCampaignName] = useState("");
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState("Casual");
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [campaignId, setCampaignId] = useState(null);

  const handleGenerate = async () => {
    if (!campaignName || !goal) {
      alert("Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://your-backend.up.railway.app/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName,
          goal,
          tone,
          userData, // just like doctorData
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create Campaign</h1>
      <Card>
        <CardContent className="p-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Campaign Name</span>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Summer Sale Campaign"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Campaign Goal</span>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Increase followers, drive website traffic"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Tone of Voice</span>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option>Casual</option>
              <option>Professional</option>
              <option>Inspirational</option>
              <option>Humorous</option>
            </select>
          </label>

          <Button className="w-full" onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate AI Suggestions"}
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mt-6 mb-2">AI Suggestions</h2>
      <Card>
        <CardContent className="p-4">
          {!suggestions ? (
            <p className="text-gray-500">Generated posts will appear here...</p>
          ) : (
            <div>
              <p><strong>Campaign ID:</strong> {campaignId}</p>
              <ul className="list-disc ml-6 space-y-2">
                {suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateCampaign;
