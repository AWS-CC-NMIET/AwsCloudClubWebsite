// components/apps/notes-app.tsx
// Apple-style Notes app with study guides and club documentation

"use client"

import React, { useState } from "react"
import { BookOpen, FileText, CheckCircle2, ChevronRight, Award, Copy, Check } from "lucide-react"

interface NoteDoc {
  id: string
  title: string
  folder: string
  date: string
  content: {
    heading: string
    subheading: string
    sections: {
      title: string
      body: string
      items?: string[]
      code?: string
    }[]
  }
}

const NOTES_DOCS: NoteDoc[] = [
  {
    id: "about-club",
    title: "About AWS SBG NMIET",
    folder: "Overview",
    date: "Sep 2026",
    content: {
      heading: "AWS SBG NMIET · Student Builder Group",
      subheading: "Official university chapter empowering student developers to build with Amazon Web Services.",
      sections: [
        {
          title: "Chapter Mission",
          body: "Our mission is to cultivate cloud fluency across university students of all academic disciplines. We offer practical, project-based learning experiences that translate academic knowledge into high-impact industry credentials.",
          items: [
            "Weekly Hands-on Architecting Workshops",
            "Certification Bootcamps with Exam Vouchers",
            "Open Source Cloud Software Development",
            "Direct Networking with AWS Cloud Ambassadors & Solution Architects",
          ],
        },
        {
          title: "Core Domain Tracks",
          body: "Students can specialize or explore across 4 key technology domains:",
          items: [
            "Cloud Architecture & DevOps: VPC networking, IAM, CI/CD pipelines, Docker, Kubernetes (EKS).",
            "Serverless & Web: AWS Lambda, API Gateway, DynamoDB, Next.js, and Amplify.",
            "AI / ML & Generative AI: AWS Bedrock, SageMaker, Rekognition, and LangChain.",
            "Cloud Security: AWS WAF, Shield, GuardDuty, KMS, and least-privilege IAM policies.",
          ],
        },
      ],
    },
  },
  {
    id: "clf-c02",
    title: "AWS Cloud Practitioner (CLF-C02) Guide",
    folder: "Certifications",
    date: "Aug 2026",
    content: {
      heading: "AWS Certified Cloud Practitioner Roadmap",
      subheading: "A comprehensive 4-week study plan for university builders taking their first official AWS exam.",
      sections: [
        {
          title: "Exam Overview & Domains",
          body: "The CLF-C02 validates an overall understanding of the AWS Cloud platform, independent of specific technical roles.",
          items: [
            "Domain 1: Cloud Concepts (24% of exam)",
            "Domain 2: Security and Compliance (30% of exam)",
            "Domain 3: Cloud Technology and Services (34% of exam)",
            "Domain 4: Billing, Pricing, and Support (12% of exam)",
          ],
        },
        {
          title: "Recommended Study Schedule",
          body: "Week 1: AWS Global Infrastructure (Regions, AZs, Edge Locations) and IAM security fundamentals. Week 2: Compute (EC2, Lambda) and Storage (S3, EBS, EFS). Week 3: Databases (RDS, DynamoDB) and Networking (VPC, Route 53, CloudFront). Week 4: Well-Architected Framework and practice exam simulations.",
          code: `# Quick AWS CLI config test\naws sts get-caller-identity\naws s3 ls`,
        },
      ],
    },
  },
  {
    id: "saa-c03",
    title: "AWS Solutions Architect (SAA-C03) Path",
    folder: "Certifications",
    date: "Jul 2026",
    content: {
      heading: "Solutions Architect Associate (SAA-C03) Deep Dive",
      subheading: "Advanced architecture patterns, high availability, fault tolerance, and cost optimization.",
      sections: [
        {
          title: "Core Architectural Principles",
          body: "Focus on designing resilient, high-performing, secure, and cost-optimized architectures using the AWS Well-Architected Framework.",
          items: [
            "Multi-Tier Web Applications with Application Load Balancer and Auto Scaling Groups",
            "VPC Peering, Transit Gateway, and NAT Gateway configurations",
            "Database Replication: Aurora Multi-AZ, Read Replicas, and DynamoDB Global Tables",
            "Decoupling Microservices with SQS, SNS, and EventBridge",
          ],
        },
      ],
    },
  },
  {
    id: "bedrock-guide",
    title: "AWS Bedrock & GenAI Handbook",
    folder: "AI / ML",
    date: "Sep 2026",
    content: {
      heading: "Generative AI on AWS Bedrock",
      subheading: "Build and scale generative AI applications using foundation models from Anthropic, Amazon, and Meta.",
      sections: [
        {
          title: "Why AWS Bedrock for Student Builders?",
          body: "Amazon Bedrock provides a single API to access leading foundation models (Claude 3.5 Sonnet, Titan, Llama 3) without managing underlying GPU clusters.",
          code: `import boto3\nimport json\n\nbedrock = boto3.client('bedrock-runtime', region_name='us-east-1')\nresponse = bedrock.invoke_model(\n    modelId='anthropic.claude-3-5-sonnet-20240620-v1:0',\n    body=json.dumps({\n        'anthropic_version': 'bedrock-2023-05-31',\n        'max_tokens': 1000,\n        'messages': [{'role': 'user', 'content': 'Explain AWS Lambda to a beginner'}]\n    })\n)`,
        },
      ],
    },
  },
]

export function NotesApp() {
  const [selectedNote, setSelectedNote] = useState<NoteDoc>(NOTES_DOCS[0])
  const [copiedCode, setCopiedCode] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="flex h-full w-full flex-col md:flex-row bg-(--win-bg) text-(--os-text)">
      {/* ── Left Sidebar Notes List ──────────────────────────────────────────── */}
      <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-(--win-divider) bg-black/[0.02] dark:bg-white/[0.02] p-2 space-y-2 overflow-y-auto">
        <div className="p-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-(--os-text-dim)">
            Club Notes & Guides
          </p>
        </div>

        <div className="space-y-1">
          {NOTES_DOCS.map(note => {
            const isSelected = selectedNote.id === note.id
            return (
              <button
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`flex w-full flex-col rounded-lg p-2.5 text-left transition-colors ${
                  isSelected
                    ? "bg-(--accent) text-white shadow-xs"
                    : "hover:bg-black/5 dark:hover:bg-white/5 text-(--os-text)"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="truncate text-xs font-semibold">{note.title}</span>
                  <span className="text-[10px] opacity-75 font-mono">{note.date}</span>
                </div>
                <span
                  className={`truncate text-[11px] mt-0.5 ${
                    isSelected ? "text-white/80" : "text-(--os-text-dim)"
                  }`}
                >
                  {note.content.subheading}
                </span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── Right Editorial Reading Pane ─────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
        <div className="border-b border-(--win-divider) pb-4 space-y-1.5">
          <span className="inline-block font-mono text-[11px] uppercase tracking-wider text-(--accent)">
            {selectedNote.folder} · {selectedNote.date}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-(--os-text)">
            {selectedNote.content.heading}
          </h1>
          <p className="text-sm leading-relaxed text-(--os-text-dim)">
            {selectedNote.content.subheading}
          </p>
        </div>

        <div className="space-y-6 max-w-2xl">
          {selectedNote.content.sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h2 className="text-base font-bold text-(--os-text)">{section.title}</h2>
              <p className="text-xs md:text-sm leading-relaxed text-(--os-text-dim)">
                {section.body}
              </p>

              {section.items && (
                <ul className="space-y-1.5 pt-1">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2 text-xs md:text-sm text-(--os-text)">
                      <CheckCircle2 className="size-4 text-(--accent) shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.code && (
                <div className="relative rounded-lg border border-(--win-divider) bg-black/90 p-3.5 font-mono text-xs text-neutral-100 dark:bg-black/60 shadow-inner">
                  <button
                    onClick={() => copyToClipboard(section.code!)}
                    className="absolute top-2.5 right-2.5 p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                    title="Copy code"
                  >
                    {copiedCode ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5 text-white/70" />}
                  </button>
                  <pre className="overflow-x-auto whitespace-pre leading-relaxed">{section.code}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
