import { db } from "@/lib/db";
const clamp=(n:number)=>Math.max(0,Math.min(200,n));
export async function forecastCapacity(horizonDays=7){
 const users=await db.user.findMany({where:{active:true,role:"HR_EXECUTIVE"},include:{employee:true}});
 const tasks=await db.hROrchestratedTask.findMany({where:{status:{in:["OPEN","IN_PROGRESS"]}}});
 const totalCapacityHours=users.length*horizonDays*8;
 const requiredHours=tasks.length*1.5;
 const utilizationPercent=totalCapacityHours?requiredHours/totalCapacityHours*100:0;
 const capacityGapHours=totalCapacityHours-requiredHours;
 const riskLevel=capacityGapHours<0?"AT_RISK":utilizationPercent>=80?"ATTENTION":"HEALTHY";
 const summary=riskLevel==="AT_RISK"?"Projected HR capacity is insufficient for the current task load.":riskLevel==="ATTENTION"?"Projected HR capacity is tightening; review priorities and deadlines.":"Projected HR capacity is sufficient for the current task load.";
 const forecast=await db.hRCapacityForecast.create({data:{forecastDate:new Date(),horizonDays,totalOpenTasks:tasks.length,totalCapacityHours,requiredHours,utilizationPercent,capacityGapHours,riskLevel,summary,evidence:{executives:users.length,assumedHoursPerTask:1.5}}});
 const actions=[];
 if(riskLevel!=="HEALTHY"&&tasks.length){
  const sorted=[...tasks].sort((a,b)=>({HIGH:0,MEDIUM:1,LOW:2}[a.priority]??1)-({HIGH:0,MEDIUM:1,LOW:2}[b.priority]??1));
  for(const task of sorted.slice(Math.max(0,users.length),Math.min(tasks.length,users.length+5))){
   const current=task.dueDate; const next=current?new Date(current.getTime()+24*3600000):undefined;
   const rec=await db.hRTaskDeadlineRecommendation.create({data:{taskId:task.id,currentDueDate:current,recommendedDueDate:next,recommendedAction:"CONSIDER_DEADLINE_SHIFT",reason:"Capacity forecast indicates limited team capacity; lower-priority work should be sequenced after critical work.",priority:task.priority,confidence:.72}});
   actions.push(rec);
  }
 }
 return {forecast,actions};
}
export async function capacitySnapshot(){
 return db.hRCapacityForecast.findMany({orderBy:{generatedAt:"desc"},take:20});
}