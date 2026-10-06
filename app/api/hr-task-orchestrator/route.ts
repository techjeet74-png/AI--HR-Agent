import { NextResponse } from "next/server";
import { createOrchestratedGoal,orchestratorSnapshot,escalateOverdueTasks } from "@/lib/hr-task-orchestrator/engine";

export async function GET(){return NextResponse.json(await orchestratorSnapshot());}
export async function POST(req:Request){
  const body=await req.json();
  if(!body?.title)return NextResponse.json({error:"title is required"},{status:400});
  return NextResponse.json(await createOrchestratedGoal(body),{status:201});
}
export async function PATCH(){return NextResponse.json({escalated:await escalateOverdueTasks()});}
