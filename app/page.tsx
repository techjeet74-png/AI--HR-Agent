import Link from "next/link";

const modules=[
["AI HR Copilot","Ask HR questions and get governed recommendations.","/"],
["Employee Master","Employee records, probation and lifecycle data.","/employees"],
["Recruitment","Jobs, candidates and application pipeline.","/recruitment"],
["Attendance & Leave","Phase 3 integration point for attendance and leave.","/"],
["Payroll","Phase 3 integration point for payroll/Odoo.","/"],
["Compliance","PF, ESIC and statutory controls.","/"],
["Documents","HR letters and controlled document generation.","/"],
["HR MIS","Headcount, hiring and workforce analytics.","/"]
];

export default function Home(){
 return <main className="shell">
  <header className="topbar"><div className="brand">AGROLT • HR AI AGENT</div><div className="badge">Phase 2 • Data & Governance</div></header>
  <section className="content">
   <div className="hero"><h1>Agrolt HR Command Center</h1><p>Governed HR operations across employee data, recruitment, payroll, compliance and AI-assisted decision support.</p></div>
   <div className="grid">{modules.map(([title,desc,url])=><Link className="card" href={url} key={title} style={{textDecoration:"none",color:"inherit"}}><h3>{title}</h3><p>{desc}</p></Link>)}</div>
   <div className="chat"><h3>AI Agent foundation</h3><p style={{color:"#667085"}}>The agent is connected to role-governed HR tools. Database-backed actions will require authentication and approval where applicable.</p></div>
  </section>
 </main>;
}
