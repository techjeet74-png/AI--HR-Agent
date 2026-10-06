import{db}from"@/lib/db";import{seedHRReportTemplates}from"@/lib/hr-reporting/template-seed";
export async function generateHRReportingTasks(periodLabel:string,assigneeIds:string[],dueDate:Date){
 await seedHRReportTemplates();
 const template=await db.hRReportTemplate.findUnique({where:{code:"WEEKLY-HR-EXEC"}});
 if(!template)return{created:0};
 let created=0;
 for(const userId of assigneeIds){
  const a=await db.hRReportAssignment.upsert({where:{templateId_assigneeId_periodLabel:{templateId:template.id,assigneeId:userId,periodLabel}},update:{dueDate,status:"PENDING"},create:{templateId:template.id,assigneeId:userId,periodLabel,dueDate}});
  const existing=a.taskId?await db.workflowTask.findUnique({where:{id:a.taskId}}):null;
  if(!existing){const task=await db.workflowTask.create({data:{userId,title:"Submit HR Executive Report - "+periodLabel,description:"Complete and submit the assigned HR Executive report. The AI Reporting Agent will consolidate your submission for HR Manager review.",priority:"HIGH",status:"OPEN",dueDate}});await db.hRReportAssignment.update({where:{id:a.id},data:{taskId:task.id}});created++;}
 }
 return{created,periodLabel,dueDate};
}