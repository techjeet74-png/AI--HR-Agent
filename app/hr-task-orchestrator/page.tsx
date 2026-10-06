"use client";
import {useEffect,useState} from "react";
export default function TaskOrchestrator(){
 const [data,setData]=useState<any>(null); const [title,setTitle]=useState("");
 const load=()=>fetch("/api/hr-task-orchestrator").then(r=>r.json()).then(setData);
 useEffect(()=>{load()},[]);
 async function create(){if(!title.trim())return;await fetch("/api/hr-task-orchestrator",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,priority:"HIGH"})});setTitle("");load()}
 async function escalate(){await fetch("/api/hr-task-orchestrator",{method:"PATCH"});load()}
 return <main className="shell"><section className="content"><h1>AI HR Task Orchestrator</h1><p>Convert HR Manager goals into accountable Executive tasks, track deadlines and escalate overdue work.</p><div className="grid"><div className="card"><b>{data?.open??"-"}</b><p>Open Tasks</p></div><div className="card"><b>{data?.overdue??"-"}</b><p>Overdue</p></div><div className="card"><b>{data?.escalated??"-"}</b><p>Open Escalations</p></div></div><div className="card"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="HR Manager goal..." /><button onClick={create}>Create Goal & Tasks</button><button onClick={escalate}>Run Escalation Check</button></div>{data?.goals?.map((g:any)=><div className="card" key={g.id}><h3>{g.title}</h3>{g.tasks.map((t:any)=><p key={t.id}>• {t.title} — {t.status} — {t.priority}</p>)}</div>)}</section></main>
}
