import { NextResponse } from "next/server";
import { forecastCapacity,capacitySnapshot } from "@/lib/hr-capacity-forecast/engine";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";

async function guard(){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s.role,"reports:read"))return NextResponse.json({error:"Forbidden"},{status:403});return null;}
export async function GET(){const denied=await guard();if(denied)return denied;return NextResponse.json(await capacitySnapshot());}
export async function POST(req:Request){const denied=await guard();if(denied)return denied;const body=await req.json().catch(()=>({}));const horizon=Number(body?.horizonDays);if(!Number.isInteger(horizon)||horizon<1||horizon>90)return NextResponse.json({error:"horizonDays must be an integer from 1 to 90"},{status:400});return NextResponse.json(await forecastCapacity(horizon),{status:201});}