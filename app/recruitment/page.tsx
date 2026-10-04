import {db} from "@/lib/db";

export default async function Recruitment(){
 const jobs=await db.job.findMany({include:{applications:true},orderBy:{createdAt:"desc"},take:50});
 return <section className="content"><div className="hero"><h1>Recruitment Pipeline</h1><p>Jobs and candidate application pipeline.</p></div><div className="grid">{jobs.map(j=><div className="card" key={j.id}><h3>{j.title}</h3><p>{j.department} • {j.location} • {j.openings} opening(s)</p><p style={{marginTop:10}}>Applications: {j.applications.length}</p></div>)}</div></section>;
}
