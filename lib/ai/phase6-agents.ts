import { ToolLoopAgent, stepCountIs, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { prisma } from "@/lib/db";

const modelId = process.env.AI_MODEL || "gpt-5.6-sol";

const workforceSnapshot = tool({
  description: "Read aggregated, non-sensitive HR workforce metrics.",
  inputSchema: z.object({}),
  execute: async () => {
    const [employees, active, probation, jobs, applications, pendingLeave, pendingApprovals] = await Promise.all([
      prisma.employee.count(), prisma.employee.count({where:{status:"ACTIVE"}}), prisma.employee.count({where:{status:"PROBATION"}}),
      prisma.job.count({where:{active:true}}), prisma.application.count(),
      prisma.leaveRequest.count({where:{status:"PENDING"}}), prisma.approvalRequest.count({where:{status:"PENDING"}})
    ]);
    return {employees,active,probation,openJobs:jobs,applications,pendingLeave,pendingApprovals};
  }
});

const recruitingSnapshot = tool({
  description: "Analyze recruitment pipeline counts and open roles.",
  inputSchema: z.object({}),
  execute: async () => {
    const jobs=await prisma.job.findMany({where:{active:true},select:{id:true,title:true,department:true,location:true,openings:true}});
    const applications=await prisma.application.groupBy({by:["status"],_count:{_all:true}});
    return {jobs,applications};
  }
});

const skillsSnapshot = tool({
  description: "Read skills and learning-gap aggregates for workforce planning.",
  inputSchema: z.object({}),
  execute: async () => {
    const skills=await prisma.skill.findMany({select:{name:true,category:true},orderBy:{name:"asc"},take:50});
    const plans=await prisma.learningPlan.findMany({where:{status:{in:["PLANNED","IN_PROGRESS"]}},select:{skillGap:true,status:true},take:100});
    return {skills,plans};
  }
});

export function createHRAgent(kind:"copilot"|"recruiting"|"workforce"|"skills") {
  const tools = kind==="recruiting" ? {recruitingSnapshot} : kind==="skills" ? {skillsSnapshot} : {workforceSnapshot};
  const instructions = "You are Agrolt Solutions' governed HR AI agent. You provide evidence-based HR analysis from approved application data. Never make autonomous decisions about hiring, termination, compensation, promotion, statutory filings, or employee discipline. Separate facts from recommendations. Flag missing data. Recommend a human approval step for high-impact actions. Agent specialization: " + kind + ".";
  return new ToolLoopAgent({model:openai(modelId),instructions,tools,stopWhen:stepCountIs(6),maxRetries:2});
}

export async function runLiveAgent(kind:"copilot"|"recruiting"|"workforce"|"skills",prompt:string,requesterId?:string){
  if(!process.env.OPENAI_API_KEY) return {configured:false,text:"Live AI is not configured. Add OPENAI_API_KEY to enable the governed LLM agent.",kind};
  const agent=createHRAgent(kind);
  const result=await agent.generate({prompt});
  if(requesterId){ const a=await prisma.agent.upsert({where:{key:"phase6-"+kind},update:{enabled:true},create:{key:"phase6-"+kind,name:"Phase 6 "+kind+" Agent",description:"Governed HR intelligence agent",category:kind}}); await prisma.agentRun.create({data:{agentId:a.id,requestedBy:requesterId,input:{prompt},output:{text:result.text},status:"COMPLETED",riskLevel:"LOW",completedAt:new Date()}}); }
  return {configured:true,text:result.text,usage:result.usage};
}
