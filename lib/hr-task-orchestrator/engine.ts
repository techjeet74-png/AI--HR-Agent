import { db } from "@/lib/db";

type GoalInput={title:string;description?:string;priority?:string;dueDate?:string;createdBy?:string};

export async function createOrchestratedGoal(input:GoalInput){
  const goal=await db.hRTaskGoal.create({data:{title:input.title,description:input.description,priority:input.priority??"MEDIUM",dueDate:input.dueDate?new Date(input.dueDate):undefined,createdBy:input.createdBy}});
  const users=await db.user.findMany({where:{active:true,role:"HR_EXECUTIVE"},include:{employee:true},orderBy:{createdAt:"asc"}});
  const titles=[
    "Define required actions and evidence",
    "Execute assigned HR activity",
    "Verify completion and update evidence",
    "Report blockers or dependencies"
  ];
  const tasks=await Promise.all(titles.map((title,i)=>db.hROrchestratedTask.create({data:{goalId:goal.id,title,description:goal.description,assigneeUserId:users[i%Math.max(users.length,1)]?.id,assigneeEmployeeId:users[i%Math.max(users.length,1)]?.employee?.id,priority:goal.priority,dueDate:goal.dueDate}})));
  return {goal,tasks};
}

export async function orchestratorSnapshot(){
  const [open,overdue,escalated,goals]=await Promise.all([
    db.hROrchestratedTask.count({where:{status:{in:["OPEN","IN_PROGRESS"]}}}),
    db.hROrchestratedTask.count({where:{status:{in:["OPEN","IN_PROGRESS"]},dueDate:{lt:new Date()}}}),
    db.hRTaskEscalation.count({where:{status:"OPEN"}}),
    db.hRTaskGoal.findMany({where:{status:"ACTIVE"},include:{tasks:true},orderBy:{updatedAt:"desc"},take:20})
  ]);
  return {open,overdue,escalated,goals};
}

export async function escalateOverdueTasks(){
  const tasks=await db.hROrchestratedTask.findMany({where:{status:{in:["OPEN","IN_PROGRESS"]},dueDate:{lt:new Date()}},include:{goal:true}});
  const results=[];
  for(const task of tasks){
    const level=task.escalationLevel+1;
    const e=await db.hRTaskEscalation.create({data:{taskId:task.id,level,reason:"Task passed its due date",status:"OPEN"}});
    await db.hROrchestratedTask.update({where:{id:task.id},data:{escalationLevel:level,priority:level>=2?"HIGH":task.priority}});
    results.push(e);
  }
  return results;
}
