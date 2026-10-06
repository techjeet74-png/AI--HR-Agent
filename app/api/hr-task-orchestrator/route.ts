import { NextResponse } from "next/server";
import { createOrchestratedGoal,orchestratorSnapshot,escalateOverdueTasks } from "@/lib/hr-task-orchestrator/engine";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";

function guard(permission="reports:read"){return getSession().then(s=>!s?NextResponse.json({error:"Unauthorized"},{status:401}):!can(s.role,permission)?NextResponse.json({error:"Forbidden"},{status:403}):null);}
export async function GET(){const denied=await guard();if(denied)return denied;return NextResponse.json(await orchestratorSnapshot());}
export async function POST(req:Request){const denied=await guard("reports:*");if(denied)return denied;const body=await req.json();if(!body?.title)return NextResponse.json({error:"title is required"},{status:400});return NextResponse.json(await createOrchestratedGoal(body),{status:201});}
export async function PATCH(){const denied=await guard("reports:*");if(denied)return denied;return NextResponse.json({escalated:await escalateOverdueTasks()});}