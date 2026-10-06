"use client";

import { useEffect, useState } from "react";

type RiskAlert = {
  id: string;
  status: string;
  severity: string;
  title: string;
  finding: string;
  confidence: number;
  horizonDays: number;
  recommendedAction?: string | null;
};

export default function RiskAlerts() {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await fetch("/api/compliance-risk/alerts");
    const data = await r.json();
    setAlerts(data.alerts || []);
  }

  async function generate() {
    setLoading(true);
    try {
      await fetch("/api/compliance-risk/alerts", { method: "POST" });
      await load();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const openAlerts = alerts.filter((x) => x.status !== "RESOLVED");
  const highRisk = openAlerts.filter((x) => x.severity === "HIGH");
  const mediumRisk = openAlerts.filter((x) => x.severity === "MEDIUM");

  return (
    <main className="shell">
      <section className="content">
        <div className="hero">
          <h1>AI Compliance Risk & Predictive Alerts</h1>
          <p>
            Explainable risk detection from compliance calendar, reconciliation
            exceptions, CAPA and historical run signals.
          </p>
          <button onClick={generate} disabled={loading}>
            {loading ? "Analyzing…" : "Generate Risk Alerts"}
          </button>
        </div>

        <div className="grid">
          <div className="card">
            <h3>Open Alerts</h3>
            <strong>{openAlerts.length}</strong>
          </div>
          <div className="card">
            <h3>High Risk</h3>
            <strong>{highRisk.length}</strong>
          </div>
          <div className="card">
            <h3>Medium Risk</h3>
            <strong>{mediumRisk.length}</strong>
          </div>
        </div>

        <div className="card">
          <h2>Risk Alerts</h2>
          {alerts.map((x) => (
            <div
              key={x.id}
              style={{ padding: "12px 0", borderBottom: "1px solid #ddd" }}
            >
              <b>
                {x.severity} · {x.title}
              </b>
              <p>{x.finding}</p>
              <small>
                Confidence: {Math.round(x.confidence * 100)}% · Horizon:{" "}
                {x.horizonDays} days · Status: {x.status}
              </small>
              <p>
                <b>Recommended:</b>{" "}
                {x.recommendedAction || "Review evidence and assign an owner."}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}