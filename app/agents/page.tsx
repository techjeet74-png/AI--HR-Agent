"use client";

import { useState } from "react";

const agents = [
  ["copilot", "HR Copilot", "Ask about workforce operations and HR priorities."],
  ["recruiting", "Recruiting Intelligence", "Analyze open roles, pipeline and hiring bottlenecks."],
  ["workforce", "Workforce Strategist", "Analyze workforce capacity, probation and HR workload."],
  ["skills", "Skills Intelligence", "Identify capability gaps and learning priorities."],
];

export default function Agents() {
  const [agent, setAgent] = useState("copilot");
  const [prompt, setPrompt] = useState(
    "Give me the top 5 HR priorities and explain the evidence.",
  );
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setResult("");
    try {
      const r = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: agent, prompt }),
      });
      const d = await r.json();
      setResult(d.text || d.error || "No result");
    } catch {
      setResult("Unable to run the agent.");
    } finally {
      setBusy(false);
    }
  }

  const selected = agents.find((x) => x[0] === agent);

  return (
    <main className="shell">
      <section className="content">
        <div className="hero">
          <h1>AI Agent Control Room</h1>
          <p>
            Governed multi-agent HR intelligence with human approval for
            high-impact decisions.
          </p>
        </div>

        <div className="grid">
          {agents.map(([key, name, description]) => (
            <button
              className="card"
              key={key}
              onClick={() => setAgent(key)}
              style={{
                textAlign: "left",
                cursor: "pointer",
                border: key === agent ? "2px solid #123b2a" : undefined,
              }}
            >
              <h3>{name}</h3>
              <p>{description}</p>
            </button>
          ))}
        </div>

        <div className="card">
          <h2>{selected?.[1]}</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #ccd3da",
            }}
          />
          <button
            onClick={run}
            disabled={busy}
            style={{ marginTop: 12, padding: "12px 18px" }}
          >
            {busy ? "Analyzing…" : "Run Agent"}
          </button>
        </div>

        {result && (
          <div className="card">
            <h2>Agent Output</h2>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{result}</p>
          </div>
        )}
      </section>
    </main>
  );
}