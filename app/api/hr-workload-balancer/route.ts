import { NextResponse } from "next/server";
import { recommendAssignments,workloadSnapshot } from "@/lib/hr-workload-balancer/balancer";
export async function GET(){return NextResponse.json(await workloadSnapshot());}
export async function POST(){return NextResponse.json({recommendations:await recommendAssignments()});}