// components/apps/aws-flagship-app.tsx
// Flagship AWS Cloud Club overview app modeled directly after AWS Cloud Club's homepage

"use client"

import React from "react"
import Image from "next/image"
import {
  ArrowRight,
  Cloud,
  Terminal,
  ShieldCheck,
  Cpu,
  Layers,
  Award,
  Users,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { windowActions } from "@/lib/aws-store"

const TECH_PILLS = [
  "Amazon EC2",
  "AWS Lambda",
  "Amazon S3",
  "Amazon DynamoDB",
  "AWS Bedrock",
  "AWS CDK",
  "Next.js",
  "TypeScript",
  "Docker",
  "AWS Cognito",
  "Amazon CloudFront",
]

const STATS = [
  { value: "500+", label: "Student Builders", context: "Active campus community" },
  { value: "15+", label: "Cloud Workshops", context: "Conducted live on campus" },
  { value: "30+", label: "AWS Certifications", context: "Earned by club members" },
  { value: "10+", label: "Live Architectures", context: "Deployed & open sourced" },
]

const FEATURED_PROJECTS = [
  {
    slug: "serverless-portal",
    title: "Campus Serverless Portal",
    summary: "Production student portal powered by Lambda, DynamoDB, API Gateway, and Cognito authentication.",
    result: "99.99% Uptime",
    context: "Zero server maintenance",
    tags: ["AWS Lambda", "DynamoDB", "Cognito", "Next.js"],
  },
  {
    slug: "cloud-resume",
    title: "AWS Cloud Resume Challenge",
    summary: "Full-stack portfolio with CI/CD pipeline, CloudFront distribution, HTTPS certs, and DynamoDB visitor counter.",
    result: "100 Lighthouse",
    context: "Global edge deployment",
    tags: ["S3", "CloudFront", "Route 53", "GitHub Actions"],
  },
  {
    slug: "bedrock-ai",
    title: "Bedrock AI Study Assistant",
    summary: "Retrieval-augmented generative AI bot for engineering coursework using AWS Bedrock and OpenSearch Serverless.",
    result: "Sub-second",
    context: "Semantic query response",
    tags: ["AWS Bedrock", "Claude 3.5", "OpenSearch", "Python"],
  },
  {
    slug: "rekognition-attendance",
    title: "Smart Attendance via AWS Rekognition",
    summary: "Computer-vision attendance system recognizing registered student faces in real-time with event-driven Lambda triggers.",
    result: "99.4% Accuracy",
    context: "Computer vision verification",
    tags: ["AWS Rekognition", "EventBridge", "S3", "DynamoDB"],
  },
]

const CLUB_PILLARS = [
  {
    title: "Hands-on Cloud Bootcamps",
    description: "Zero-cost university workshops guiding students from IAM fundamentals to automated CI/CD and container clusters.",
    credit: "Lead by Cloud Architecture Track",
  },
  {
    title: "AWS Certification Cohorts",
    description: "Structured 6-week study circles for AWS Certified Cloud Practitioner and Solutions Architect Associate.",
    credit: "Lead by Certifications Team",
  },
  {
    title: "GenAI on AWS Bedrock",
    description: "Hands-on exploration of foundation models, RAG pipelines, and conversational AI built on managed AWS Bedrock infrastructure.",
    credit: "Lead by AI/ML Domain",
  },
  {
    title: "Production Architecture Labs",
    description: "Real-world infrastructure design: multi-tier VPCs, high availability across AZs, auto-scaling, and cost optimization.",
    credit: "Lead by DevOps Track",
  },
]

const JOURNEY_STEPS = [
  {
    number: "01",
    title: "Onboard & Discover",
    body: "Create your AWS Educate account, master IAM security best practices, and set up your local development CLI tools.",
  },
  {
    number: "02",
    title: "Build & Architect",
    body: "Collaborate on real-world projects with domain leads across Serverless, DevOps, Full-Stack, and Generative AI.",
  },
  {
    number: "03",
    title: "Certify & Validate",
    body: "Complete guided study sprints, practice exam simulations, and earn official industry-recognized AWS credentials.",
  },
  {
    number: "04",
    title: "Deploy & Lead",
    body: "Present your projects at campus demo days, contribute to open source, and mentor upcoming student builders.",
  },
]

export function AwsFlagshipApp() {
  return (
    <div className="min-h-full w-full bg-[#fbfbfe] dark:bg-[#18181d] text-neutral-800 dark:text-neutral-100 selection:bg-[#7940ea]/30 selection:text-white">
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-10 md:py-12 space-y-12">
        {/* ── Editorial Header ────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7940ea]/40 bg-[#7940ea]/10 px-3 py-1 font-mono text-xs font-semibold text-[#7940ea] dark:text-[#c084fc]">
            <Sparkles className="size-3.5" />
            <span>AWS SBG NMIET · Official Student Builder Group</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl text-neutral-900 dark:text-white leading-[1.12]">
            Empowering university students to build, architect, and lead on Amazon Web Services.
          </h1>

          <p className="text-base md:text-lg leading-relaxed text-neutral-600 dark:text-neutral-300 max-w-3xl">
            We bridge academic fundamentals and production-grade cloud engineering. AWS SBG NMIET
            is an official student-led engineering community providing hands-on cloud labs, certification
            mentorship, hackathon squads, and industry connections.
          </p>

          {/* Tech Pills */}
          <div className="pt-2">
            <p className="text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5">
              Cloud Stack & Technologies:
            </p>
            <div className="flex flex-wrap gap-2">
              {TECH_PILLS.map(tech => (
                <span
                  key={tech}
                  className="rounded-md border border-black/10 dark:border-white/12 bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:border-[#7940ea] hover:text-[#7940ea] dark:hover:text-white hover:bg-[#7940ea]/10 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Verified Results Grid ────────────────────────────────────────────── */}
        <section className="border-t border-black/10 dark:border-white/10 pt-8">
          <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#7940ea] dark:text-[#a855f7] font-bold mb-5">
            Verified Community Impact
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map(stat => (
              <div
                key={stat.label}
                className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#222228] p-4 space-y-1 shadow-xs dark:shadow-md hover:border-[#7940ea]/40 transition-colors"
              >
                <span className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  {stat.value}
                </span>
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">{stat.label}</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{stat.context}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Selected Work Showcase ───────────────────────────────────────────── */}
        <section className="border-t border-black/10 dark:border-white/10 pt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#7940ea] dark:text-[#a855f7] font-bold">
                Featured Deployments
              </h2>
              <p className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
                Cloud architectures engineered by club members
              </p>
            </div>
            <button
              onClick={() => windowActions.open("finder")}
              className="hidden items-center gap-1 text-xs font-bold text-[#7940ea] dark:text-[#a855f7] hover:text-[#9333ea] dark:hover:text-[#c084fc] hover:underline sm:flex"
            >
              <span>Open Finder</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURED_PROJECTS.map(item => (
              <div
                key={item.slug}
                className="group flex flex-col justify-between rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#222228] p-5 hover:border-[#7940ea]/50 hover:bg-neutral-50 dark:hover:bg-[#25252c] transition-all shadow-xs dark:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-[#7940ea] dark:text-[#a855f7]">
                      {item.result} · {item.context}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-[#7940ea] dark:group-hover:text-[#c084fc] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">{item.summary}</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-3">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-neutral-600 dark:text-neutral-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => windowActions.open("finder")}
                    className="text-xs font-medium text-[#7940ea] dark:text-[#a855f7] hover:text-[#9333ea] dark:hover:text-[#c084fc] hover:underline flex items-center gap-1"
                  >
                    Details <ExternalLink className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Club Tracks & Features ───────────────────────────────────────────── */}
        <section className="border-t border-black/10 dark:border-white/10 pt-8 space-y-6">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#7940ea] dark:text-[#a855f7] font-bold">
              Core Club Offerings
            </h2>
            <p className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
              How we prepare students for high-scale cloud careers
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CLUB_PILLARS.map(pillar => (
              <div
                key={pillar.title}
                className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#222228] p-5 space-y-2 hover:border-[#7940ea]/40 transition-colors shadow-xs dark:shadow-md"
              >
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">{pillar.title}</h3>
                <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">{pillar.description}</p>
                <p className="text-[11px] font-mono text-[#7940ea] dark:text-[#a855f7] font-medium pt-1">{pillar.credit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Four-Step Builder Journey ────────────────────────────────────────── */}
        <section className="border-t border-black/10 dark:border-white/10 pt-8 space-y-6">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#7940ea] dark:text-[#a855f7] font-bold">
              The Builder Curriculum
            </h2>
            <p className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
              From zero cloud knowledge to certified builder
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {JOURNEY_STEPS.map(step => (
              <div
                key={step.number}
                className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#222228] p-4 space-y-2 hover:border-[#7940ea]/40 transition-colors shadow-xs dark:shadow-md"
              >
                <span className="font-mono text-xs font-bold text-[#7940ea] dark:text-[#a855f7]">{step.number}</span>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{step.title}</h3>
                <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Primary Call to Action ───────────────────────────────────────────── */}
        <section className="rounded-2xl border border-[#7940ea]/30 bg-gradient-to-br from-[#7940ea]/15 via-purple-500/10 to-neutral-100 dark:to-[#222228] p-6 md:p-8 space-y-4 shadow-xl">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Ready to build in the cloud?</h2>
          <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 max-w-xl">
            Join the AWS SBG NMIET chapter today. Attend our upcoming workshops, get access to
            certification vouchers, and collaborate with student developers building real software.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => windowActions.open("mail")}
              className="flex items-center gap-2 rounded-lg bg-[#7940ea] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#8c4bff] shadow-lg shadow-[#7940ea]/25 transition-all"
            >
              <span>Apply to Join</span>
              <ArrowRight className="size-3.5" />
            </button>

            <button
              onClick={() => windowActions.open("calendar")}
              className="flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-[#282832] px-4 py-2.5 text-xs font-semibold text-neutral-800 dark:text-white hover:border-[#7940ea] hover:bg-[#7940ea]/10 transition-colors"
            >
              <span>Upcoming Workshops</span>
            </button>

            <button
              onClick={() => windowActions.open("notes")}
              className="flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-[#282832] px-4 py-2.5 text-xs font-semibold text-neutral-800 dark:text-white hover:border-[#7940ea] hover:bg-[#7940ea]/10 transition-colors"
            >
              <span>Certification Roadmaps</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
