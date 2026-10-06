import { NextResponse } from "next/server";
import { recommendAssignments,workloadSnapshot } from "@/lib/hr-workload-balancer/balancer";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";

async function guard(){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s.role,"reports:read"))return NextResponse.json({error:"Forbidden"},{status:403});return null;}
export async function GET(){const denied=await guard();if(denied)return denied;return NextResponse.json(await workloadSnapshot());}
export async function POST(){const denied=await guard();if(denied)return denied;return NextResponse.json({recommendations:await recommendAssignments()});}