import { db } from "@/lib/db";
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
export async function recommendAssignments(){
 const tasks=await db.hROrchestratedTask.findMany({where:{status:{in:["OPEN","IN_PROGRESS"]}},include:{goal:true}});
 const users=await db.user.findMany({where:{active:true,role:"HR_EXECUTIVE"},include:{employee:true}});
 const results=[];
 for(const task of tasks){
  const candidates=[];
  for(const u of users){
   const employee=u.employee; if(!employee) continue;
   const assigned=await db.hROrchestratedTask.count({where:{assigneeUserId:u.id,status:{in:["OPEN","IN_PROGRESS"]}}});
   const workloadScore=clamp(100-assigned*15), skillFitScore=50;
   const responsibilityScore=task.title.toLowerCase().includes(employee.department.toLowerCase())?90:60;
   const availabilityScore=employee.status==="ACTIVE"?100:20;
   const priorityFitScore=task.priority==="HIGH"&&assigned<3?90:70;
   const totalScore=clamp(workloadScore*.35+skillFitScore*.15+responsibilityScore*.15+availabilityScore*.15+priorityFitScore*.2);
   candidates.push({u,employee,assigned,workloadScore,skillFitScore,responsibilityScore,availabilityScore,priorityFitScore,totalScore});
  }
  candidates.sort((a,b)=>b.totalScore-a.totalScore); const best=candidates[0];
  if(best) results.push(await db.hRTaskAssignmentRecommendation.create({data:{taskId:task.id,recommendedUserId:best.u.id,recommendedEmployeeId:best.employee.id,workloadScore:best.workloadScore,skillFitScore:best.skillFitScore,responsibilityScore:best.responsibilityScore,availabilityScore:best.availabilityScore,priorityFitScore:best.priorityFitScore,totalScore:best.totalScore,rationale:"Recommended using workload, availability, responsibility and priority fit."}}));
 }
 return results;
}
export async function workloadSnapshot(){
 const users=await db.user.findMany({where:{active:true,role:"HR_EXECUTIVE"},include:{employee:true}});
 const rows=[]; for(const u of users) rows.push({userId:u.id,name:u.name,employee:u.employee?.employeeCode??null,activeTasks:await db.hROrchestratedTask.count({where:{assigneeUserId:u.id,status:{in:["OPEN","IN_PROGRESS"]}}})});
 const recommendations=await db.hRTaskAssignmentRecommendation.findMany({where:{status:"RECOMMENDED"},orderBy:{totalScore:"desc"},take:50,include:{task:true}});
 return {workload:rows,recommendations};
}