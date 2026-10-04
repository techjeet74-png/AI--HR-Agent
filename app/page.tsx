"use client";
import {useState} from "react";

const modules=[
["AI HR Copilot","Ask HR questions, summarize work and recommend next actions."],
["Recruitment Agent","Job requisitions, CV screening, interview pipeline and hiring analytics."],
["Employee Lifecycle","Joining, onboarding, probation, transfers, promotions and exits."],
["Attendance & Leave","Attendance exceptions, leave balances and manager follow-ups."],
["Payroll Agent","Payroll checks, anomalies, approvals and salary-process controls."],
["Compliance Agent","PF, ESIC, bonus, gratuity, labour-law calendars and audit readiness."],
["Documents","Appointment letters, warnings, confirmations, show-cause notices and HR letters."],
["HR MIS","Monthly HR dashboard, headcount, attrition, hiring and compliance KPIs."]
];

export default function Home(){
 const [q,setQ]=useState("");
 return <main className="shell">
  <header className="topbar"><div className="brand">AGROLT • HR AI AGENT</div><div className="badge">HR Command Center</div></header>
  <section className="content">
   <div className="hero"><h1>Agrolt HR Command Center</h1><p>One AI workspace for recruitment, employee lifecycle, attendance, payroll, compliance, documents and HR MIS.</p></div>
   <div className="grid">{modules.map(([title,desc])=><div className="card" key={title}><h3>{title}</h3><p>{desc}</p></div>)}</div>
   <div className="chat"><h3>Ask the HR Agent</h3><p style={{color:"#667085"}}>Try: “Show probation ending this month” or “Prepare the monthly HR MIS.”</p><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ask an HR question..." aria-label="Ask the HR Agent"/></div>
  </section>
 </main>;
}