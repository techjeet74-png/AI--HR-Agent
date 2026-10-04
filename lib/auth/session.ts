import {jwtVerify,SignJWT} from "jose";
import {cookies} from "next/headers";
const secret=new TextEncoder().encode(process.env.AUTH_SECRET||"change-this-in-production");
export type Session={userId:string;role:string;name:string;email:string};
export async function createSession(session:Session){
 const token=await new SignJWT(session).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("8h").sign(secret);
 const jar=await cookies(); jar.set("agrolt_hr_session",token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:28800,path:"/"});
}
export async function getSession():Promise<Session|null>{
 try{const token=(await cookies()).get("agrolt_hr_session")?.value;if(!token)return null;const {payload}=await jwtVerify(token,secret);return payload as unknown as Session;}catch{return null;}
}
export async function clearSession(){(await cookies()).delete("agrolt_hr_session");}
