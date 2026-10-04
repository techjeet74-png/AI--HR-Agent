export type HRIntent="recruitment"|"employee_lifecycle"|"attendance_leave"|"payroll"|"compliance"|"documents"|"mis"|"policy"|"unknown";

const rules:Array<[HRIntent,RegExp]>=[
 ["recruitment",/recruit|candidate|resume|cv|interview|vacancy|job/i],
 ["employee_lifecycle",/joining|onboard|probation|confirmation|transfer|promotion|exit|resign/i],
 ["attendance_leave",/attendance|absent|late|leave|shift|overtime/i],
 ["payroll",/payroll|salary|wage|payslip|overtime|deduction/i],
 ["compliance",/pf|epf|esic|esi|gratuity|bonus|labou?r|statutory|compliance/i],
 ["documents",/appointment letter|warning|show cause|confirmation letter|experience letter|document/i],
 ["mis",/mis|dashboard|headcount|attrition|manpower|kpi|report/i],
 ["policy",/policy|sop|procedure|handbook|rule/i]
];

export function classifyHRIntent(input:string):HRIntent{
 for(const [intent,pattern] of rules) if(pattern.test(input)) return intent;
 return "unknown";
}

export function getHRSystemPrompt(){
 return [
 "You are the Agrolt HR AI Agent for Agrolt Solutions Pvt Ltd.",
 "Use governed HR tools for factual records; never invent employee or payroll data.",
 "Respect role-based permissions and create approval requests before high-impact actions.",
 "High-impact actions include payroll changes, termination, statutory submission and issuing controlled HR documents.",
 "State assumptions and distinguish company policy from current law.",
 "Known payroll workflow: approvals by the 3rd, processing cut-off by the 5th, salary credit on the 7th.",
 "Every write action should have an actor, reason, target entity and audit trail."
 ].join("\n");
}
