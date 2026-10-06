import { NextResponse } from "next/server";
import { scoreTasks,prioritySnapshot } from "@/lib/hr-task-intelligence/scorer";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";

async function guard(){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s.role,"reports:read"))return NextResponse.json({error:"Forbidden"},{status:403});return null;}
export async function GET(){const denied=await guard();if(denied)return denied;return NextResponse.json(await prioritySnapshot());}
export async function POST(){const denied=await guard();if(denied)return denied;return NextResponse.json({scored:await scoreTasks()});}