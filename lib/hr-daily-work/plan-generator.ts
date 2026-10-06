import{db}from"@/lib/db";
const ROLE_TASKS:any={HR_EXECUTIVE:["Review today's attendance exceptions","Update recruitment pipeline","Follow up on pending employee requests","Update assigned HR compliance/actions","Close or update yesterday's pending tasks"],HR_MANAGER:["Review HR Executive pending tasks","Review critical HR exceptions","Review daily HR metrics","Approve priority HR actions"]};
export async function generateDailyWorkPlans(workDate:Date,userIds:string[],generatedBy?:string){
 const tasks=[];
 const start=new Date(workDate);start.setHours(0,0,0,0);const end=new Date(start);end.setDate(end.getDate()+1);
 for(const userId of userIds){
  const user=await db.user.findUnique({where:{id:userId}});
  if(!user)continue;
  const existing=await db.workflowTask.findMany({where:{userId,status:{in:["OPEN","IN_PROGRESS"]},dueDate:{lt:end}}});
  const overdue=existing.filter(x=>x.dueDate&&x.dueDate<start);
  const titles=ROLE_TASKS[user.role]||["Review assigned HR tasks","Update pending HR activities"];
  const today=await db.workflowTask.findMany({where:{userId,createdAt:{gte:start,lt:end}}});
  for(const title of titles){
   if(!today.some(x=>x.title===title))tasks.push(await db.workflowTask.create({data:{userId,title,description:"AI-generated daily HR work task. Update status and add notes/evidence when completed.",priority:title.includes("critical")||title.includes("priority")?"HIGH":"MEDIUM",status:"OPEN",dueDate:end}}));
  }
  await db.hRDailyWorkPlan.upsert({where:{workDate_userId:{workDate:start,userId}},update:{generatedTasks:tasks.filter(x=>x.userId===userId).map(x=>x.id),overdueTasks:overdue.map(x=>x.id),generatedBy,status:"OPEN"},create:{workDate:start,userId,generatedTasks:tasks.filter(x=>x.userId===userId).map(x=>x.id),overdueTasks:overdue.map(x=>x.id),generatedBy}});
 }
 return{workDate:start.toISOString(),created:tasks.length};
}