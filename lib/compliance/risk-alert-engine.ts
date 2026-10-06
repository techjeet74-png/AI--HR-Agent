import{db}from"@/lib/db";
export async function generateComplianceRiskAlerts(userId?:string){
 const now=new Date(),soon=new Date(now.getTime()+7*86400000),recent=new Date(now.getTime()-30*86400000);
 const [instances,exceptions,capas,runs]=await Promise.all([
  db.complianceInstance.findMany({where:{status:{not:"COMPLETED"}}}),
  db.reconciliationException.findMany({where:{status:{not:"RESOLVED"}},take:500}),
  db.reconciliationCapa.findMany({where:{status:{not:"CLOSED"}},take:500}),
  db.reconciliationRun.findMany({orderBy:{createdAt:"desc"},take:100})
 ]);
 const alerts:any[]=[];
 const overdue=instances.filter(x=>x.dueDate<now);
 const upcoming=instances.filter(x=>x.dueDate>=now&&x.dueDate<=soon);
 if(overdue.length)alerts.push({alertType:"OVERDUE_TREND",category:"CALENDAR",severity:"HIGH",confidence:.98,horizonDays:7,title:"Overdue compliance obligations detected",finding:String(overdue.length)+" active obligation(s) are overdue.",evidence:{count:overdue.length,instanceIds:overdue.slice(0,20).map(x=>x.id)},recommendedAction:"Review overdue obligations, confirm owner and record evidence or remediation.",sourceEntityType:"ComplianceInstance"});
 if(upcoming.length>=3)alerts.push({alertType:"DUE_CLUSTER",category:"CALENDAR",severity:"MEDIUM",confidence:.9,horizonDays:7,title:"Compliance due-date cluster",finding:String(upcoming.length)+" obligations are due within seven days.",evidence:{count:upcoming.length},recommendedAction:"Prioritize the due-date cluster and confirm evidence availability.",sourceEntityType:"ComplianceInstance"});
 const high=exceptions.filter(x=>x.severity==="HIGH");
 if(high.length)alerts.push({alertType:"HIGH_EXCEPTION_BACKLOG",category:"RECONCILIATION",severity:"HIGH",confidence:.97,horizonDays:14,title:"High-risk reconciliation backlog",finding:String(high.length)+" high-risk reconciliation exception(s) remain unresolved.",evidence:{count:high.length,exceptionIds:high.slice(0,20).map(x=>x.id)},recommendedAction:"Assign reviewers and create/complete CAPA for high-risk exceptions.",sourceEntityType:"ReconciliationException"});
 if(capas.length>=3)alerts.push({alertType:"CAPA_BACKLOG",category:"CAPA",severity:"MEDIUM",confidence:.92,horizonDays:30,title:"CAPA backlog risk",finding:String(capas.length)+" CAPA item(s) remain open.",evidence:{count:capas.length,capaIds:capas.slice(0,20).map(x=>x.id)},recommendedAction:"Review target dates and close effective CAPA actions.",sourceEntityType:"ReconciliationCapa"});
 const recentRuns=runs.filter(x=>x.createdAt>=recent),failed=recentRuns.filter(x=>((x.resultSummary as any)?.exceptions||0)>0);
 if(recentRuns.length>=3&&failed.length/recentRuns.length>=.5)alerts.push({alertType:"RECURRING_RECONCILIATION_FAILURE",category:"RECONCILIATION",severity:"HIGH",confidence:.88,horizonDays:30,title:"Recurring reconciliation exceptions",finding:"At least half of recent reconciliation runs contain exceptions.",evidence:{recentRuns:recentRuns.length,failedRuns:failed.length},recommendedAction:"Investigate root cause and establish preventive controls.",sourceEntityType:"ReconciliationRun"});
 const created=[];
 for(const a of alerts)created.push(await db.complianceRiskAlert.create({data:{...a,generatedBy:undefined}}).catch(async()=>db.complianceRiskAlert.create({data:a})));
 return{alerts:created,count:created.length,generatedAt:now.toISOString(),generatedBy:userId};
}