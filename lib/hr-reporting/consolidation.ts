import{db}from"@/lib/db";
export async function consolidateHRReports(periodLabel:string,preparedBy?:string){
 const submissions=await db.hRReportSubmission.findMany({where:{periodLabel},include:{template:true,assignment:{include:{template:true}}}});
 const assignments=await db.hRReportAssignment.findMany({where:{periodLabel},include:{template:true}});
 const pending=assignments.filter(a=>!submissions.some(s=>s.assignmentId===a.id));
 const incomplete=submissions.filter(s=>s.status==="INCOMPLETE");
 const sections:any={};
 for(const s of submissions){const d=s.data as any;for(const [k,v] of Object.entries(d||{})){if(!sections[k])sections[k]=[];sections[k].push({submissionId:s.id,value:v});}}
 const actionItems=[...pending.map(a=>({type:"MISSING_REPORT",assigneeId:a.assigneeId,assignmentId:a.id,dueDate:a.dueDate.toISOString(),action:"Submit "+a.template.title})),...incomplete.map(s=>({type:"INCOMPLETE_REPORT",submissionId:s.id,action:"Complete missing report sections",missing:(s.exceptions as any)?.missingSections||[]}))];
 const summary="HR Executive reporting consolidation for "+periodLabel+": "+submissions.length+" submitted, "+pending.length+" pending, "+incomplete.length+" incomplete.";
 return db.hRManagementReport.upsert({where:{periodLabel_reportType:{periodLabel,reportType:"HR-EXECUTIVE-CONSOLIDATED"}},update:{submissionIds:submissions.map(x=>x.id),consolidatedData:sections,executiveSummary:summary,pendingSubmissions:pending.map(x=>({assignmentId:x.id,assigneeId:x.assigneeId,dueDate:x.dueDate})),actionItems,status:"READY_FOR_MANAGER_REVIEW",preparedBy},create:{periodLabel,reportType:"HR-EXECUTIVE-CONSOLIDATED",submissionIds:submissions.map(x=>x.id),consolidatedData:sections,executiveSummary:summary,pendingSubmissions:pending.map(x=>({assignmentId:x.id,assigneeId:x.assigneeId,dueDate:x.dueDate})),actionItems,status:"READY_FOR_MANAGER_REVIEW",preparedBy}});
}