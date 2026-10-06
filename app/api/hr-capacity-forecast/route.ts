import { NextResponse } from "next/server";
import { forecastCapacity,capacitySnapshot } from "@/lib/hr-capacity-forecast/engine";
export async function GET(){return NextResponse.json(await capacitySnapshot());}
export async function POST(req:Request){const body=await req.json().catch(()=>({}));return NextResponse.json(await forecastCapacity(Number(body?.horizonDays)||7),{status:201});}