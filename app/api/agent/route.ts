import {NextResponse} from "next/server";
import {classifyHRIntent,getHRSystemPrompt} from "@/lib/agents/hr-agent";

export async function POST(request:Request){
 const body=await request.json().catch(()=>({}));
 const message=typeof body.message==="string"?body.message.trim():"";
 if(!message) return NextResponse.json({error:"message is required"},{status:400});
 const intent=classifyHRIntent(message);
 return NextResponse.json({
   ok:true,
   intent,
   systemPrompt:getHRSystemPrompt(),
   tools:["listEmployees","probationEnding","createApproval"],
   response:"Request classified and routed to the governed HR tool layer. Connect authentication and an approved AI provider to execute the requested operation.",
   requiresApproval:["payroll","compliance","employee_lifecycle"].includes(intent)
 });
}