export type HRIntent =
 | "recruitment"|"employee_lifecycle"|"attendance_leave"|"payroll"
 | "compliance"|"documents"|"mis"|"policy"|"unknown";

const rules:Array<[HRIntent,RegExp]>= [
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
 "You are Agrolt HR AI Agent for Agrolt Solutions Pvt Ltd.",
 "Act as an HR operations copilot, not an autonomous decision maker.",
 "Give practical, traceable answers and clearly state assumptions.",
 "Never invent employee, payroll, attendance or compliance data.",
 "Sensitive actions such as salary changes, termination, statutory filings or employee-status changes require authorized HR approval.",
 "Use Agrolt workflows where known: payroll approvals by the 3rd, salary processing cut-off by the 5th, salary credit on the 7th.",
 "For legal/statutory questions, distinguish company policy from applicable law and flag items requiring current verification.",
 "When asked to execute an action, first identify required inputs, authorization and audit trail."
 ].join("\n");
}