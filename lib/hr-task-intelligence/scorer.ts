import { db } from "@/lib/db";
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
export async function scoreTasks(){
 const now=new Date(); const tasks=await db.hROrchestratedTask.findMany({where:{status:{in:["OPEN","IN_PROGRESS"]}},include:{goal:true}}); const scored=[];
 for(const task of tasks){
  const hours=task.dueDate?((task.dueDate.getTime()-now.getTime())/36e5):168;
  const urgency=clamp(hours<=0?100:Math.max(0,100-hours/48*100));
  const impact=task.priority==="HIGH"?90:task.priority==="LOW"?35:65;
  const text=(task.title+" "+(task.description??"")).toLowerCase();
  const complianceRisk=/compliance|statutory|pf|esi|payroll|legal/.test(text)?90:25;
  const dependencyRisk=/block|depend|approval|review|evidence/.test(text)?70:20;
  const workloadFactor=50; const deadlineRisk=urgency;
  const score=clamp(urgency*.25+impact*.2+complianceRisk*.2+dependencyRisk*.1+workloadFactor*.1+deadlineRisk*.15);
  const priorityBand=score>=75?"CRITICAL":score>=55?"HIGH":score>=35?"MEDIUM":"LOW";
  const rationale="Score "+score.toFixed(1)+" from urgency "+urgency.toFixed(0)+", impact "+impact+", compliance risk "+complianceRisk+", dependency risk "+dependencyRisk+", workload factor "+workloadFactor+", deadline risk "+deadlineRisk.toFixed(0)+".";
  scored.push(await db.hRTaskPriorityScore.create({data:{taskId:task.id,urgency,impact,complianceRisk,dependencyRisk,workloadFactor,deadlineRisk,score,priorityBand,rationale}}));
 }
 return scored.sort((a,b)=>b.score-a.score);
}
export async function prioritySnapshot(){
 const latest=await db.hRTaskPriorityScore.findMany({orderBy:{score:"desc"},take:50,include:{task:true}});
 return {critical:latest.filter(x=>x.priorityBand==="CRITICAL").length,high:latest.filter(x=>x.priorityBand==="HIGH").length,medium:latest.filter(x=>x.priorityBand==="MEDIUM").length,low:latest.filter(x=>x.priorityBand==="LOW").length,tasks:latest};
}