import { NextResponse } from "next/server";
import { scoreTasks,prioritySnapshot } from "@/lib/hr-task-intelligence/scorer";
export async function GET(){return NextResponse.json(await prioritySnapshot());}
export async function POST(){return NextResponse.json({scored:await scoreTasks()});}