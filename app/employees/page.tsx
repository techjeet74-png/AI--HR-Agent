import {db} from "@/lib/db";

export default async function Employees(){
 const employees=await db.employee.findMany({orderBy:{employeeCode:"asc"},take:100});
 return <section className="content"><div className="hero"><h1>Employee Master</h1><p>Central employee records for Agrolt HR operations.</p></div><div className="card" style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr><th align="left">Code</th><th align="left">Employee</th><th align="left">Department</th><th align="left">Designation</th><th align="left">Location</th><th align="left">Status</th></tr></thead><tbody>{employees.map(e=><tr key={e.id}><td>{e.employeeCode}</td><td>{e.firstName} {e.lastName||""}</td><td>{e.department}</td><td>{e.designation}</td><td>{e.location}</td><td>{e.status}</td></tr>)}</tbody></table></div></section>;
}
