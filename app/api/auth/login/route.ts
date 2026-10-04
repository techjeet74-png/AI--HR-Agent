import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {db} from "@/lib/db";
import {createSession} from "@/lib/auth/session";
export async function POST(req:Request){
 const {email,password}=await req.json().catch(()=>({}));
 if(typeof email!=="string"||typeof password!=="string")return NextResponse.json({error:"Email and password are required"},{status:400});
 const user=await db.user.findUnique({where:{email:email.toLowerCase()},include:{employee:true}});
 if(!user||!user.active||!(await bcrypt.compare(password,user.passwordHash)))return NextResponse.json({error:"Invalid credentials"},{status:401});
 await createSession({userId:user.id,role:user.role,name:user.name,email:user.email});
 return NextResponse.json({ok:true,user:{id:user.id,name:user.name,email:user.email,role:user.role}});
}