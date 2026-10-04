import {NextResponse} from "next/server";
import {db} from "@/lib/db";

export async function GET(request:Request){
 const url=new URL(request.url);
 const department=url.searchParams.get("department")||undefined;
 const employees=await db.employee.findMany({where:department?{department}:undefined,orderBy:{employeeCode:"asc"}});
 return NextResponse.json({employees});
}