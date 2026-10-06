import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const jobId = String(b.jobId || "");
  const candidateId = String(b.candidateId || "");
  if (!jobId || !candidateId) return NextResponse.json({ error: "jobId and candidateId required" }, { status: 400 });

  const [job, candidate] = await Promise.all([
    prisma.job.findUnique({
      where: { id: jobId },
      include: { skillRequirements: { include: { skill: true } } },
    }),
    prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { candidateSkills: { include: { skill: true } } },
    }),
  ]);

  if (!job || !candidate) return NextResponse.json({ error: "Job or candidate not found" }, { status: 404 });
  const skills = new Map(candidate.candidateSkills.map((x) => [x.skill.name.toLowerCase(), x.level]));
  let weight = 0, earned = 0;
  for (const req of job.skillRequirements) {
    weight += req.weight;
    const level = skills.get(req.skill.name.toLowerCase()) || 0;
    earned += Math.min(level / Math.max(req.requiredLevel, 1), 1) * req.weight;
  }
  const score = weight ? Math.round((earned / weight) * 100) : 0;
  return NextResponse.json({
    score,
    explanation: "Skills-based matching score. Human review is required before selection.",
    matchedSkills: job.skillRequirements.map((r) => ({
      skill: r.skill.name,
      required: r.requiredLevel,
      candidate: skills.get(r.skill.name.toLowerCase()) || 0,
    })),
  });
}