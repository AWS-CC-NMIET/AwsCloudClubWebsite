// components/apps/finder-app.tsx
// Authentic macOS Finder layout for browsing AWS Cloud Club projects and architectures

"use client"

import React, { useState } from "react"
import {
  Folder,
  FolderOpen,
  LayoutGrid,
  Columns,
  List,
  ExternalLink,
  Github,
  Globe,
  Tag,
  Server,
  Cloud,
  Cpu,
  Database,
  Search,
} from "lucide-react"
import { windowActions } from "@/lib/aws-store"
import { sanitizeUrl } from "@/lib/utils"

interface ProjectItem {
  id: string
  title: string
  category: "serverless" | "aiml" | "devops" | "hackathon"
  description: string
  architecture: string
  services: string[]
  liveUrl?: string
  githubUrl?: string
  team: string[]
  year: string
}

const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "serverless-portal",
    title: "Campus Serverless Portal",
    category: "serverless",
    description: "A student-facing portal handling course evaluations and event registrations without maintaining any virtual servers.",
    architecture: "Next.js frontend -> Amazon CloudFront -> API Gateway -> AWS Lambda (Node.js 20) -> Amazon DynamoDB with Cognito User Pool authentication.",
    services: ["AWS Lambda", "Amazon DynamoDB", "Amazon API Gateway", "Amazon Cognito", "Amazon CloudFront"],
    liveUrl: "https://portal.awsclub.edu",
    githubUrl: "https://github.com/aws-cloud-club/campus-serverless-portal",
    team: ["Omkar Rane", "Cloud Team Leads"],
    year: "2026",
  },
  {
    id: "cloud-resume",
    title: "AWS Cloud Resume Challenge",
    category: "devops",
    description: "Production resume hosted on static S3 bucket with HTTPS custom domain, visitor counter API, and automated GitHub Actions CI/CD deployment.",
    architecture: "S3 Bucket (Static Web) -> Route 53 DNS -> ACM SSL Certificate -> CloudFront CDN -> API Gateway -> Python Lambda -> DynamoDB Atomic Counter.",
    services: ["Amazon S3", "Amazon CloudFront", "Amazon Route 53", "AWS Lambda", "Amazon DynamoDB"],
    liveUrl: "https://resume.awsclub.edu",
    githubUrl: "https://github.com/aws-cloud-club/cloud-resume-challenge",
    team: ["Builder Cohort 2025"],
    year: "2025",
  },
  {
    id: "bedrock-ai-assistant",
    title: "Bedrock GenAI Campus Assistant",
    category: "aiml",
    description: "An intelligent query engine indexing university syllabus documents and answering engineering questions with low latency.",
    architecture: "Documents stored in S3 -> OpenSearch Serverless vector index -> AWS Bedrock (Claude 3.5 Sonnet) RAG pipeline -> Streamlit & Next.js UI.",
    services: ["AWS Bedrock", "Amazon OpenSearch", "Amazon S3", "AWS Lambda", "IAM"],
    liveUrl: "https://ai.awsclub.edu",
    githubUrl: "https://github.com/aws-cloud-club/bedrock-assistant",
    team: ["AI/ML Lead", "Research Team"],
    year: "2026",
  },
  {
    id: "rekognition-attendance",
    title: "Smart Attendance via Rekognition",
    category: "aiml",
    description: "Computer-vision attendance tracking system utilizing facial analysis for registered workshop participants with event-driven photo processing.",
    architecture: "Camera capture -> S3 Bucket PUT event -> EventBridge trigger -> Lambda worker -> Amazon Rekognition Collection -> DynamoDB Attendance Records.",
    services: ["Amazon Rekognition", "Amazon EventBridge", "AWS Lambda", "Amazon S3", "Amazon DynamoDB"],
    liveUrl: "https://attendance.awsclub.edu",
    githubUrl: "https://github.com/aws-cloud-club/rekognition-attendance",
    team: ["Computer Vision Track"],
    year: "2025",
  },
  {
    id: "multi-tier-resilience",
    title: "Multi-Region Disaster Recovery Stack",
    category: "devops",
    description: "High availability architectural blueprint featuring auto-scaling EC2 clusters across multiple Availability Zones with automated failover.",
    architecture: "Route 53 latency routing -> Application Load Balancer -> Auto Scaling Group -> RDS Aurora Multi-AZ with cross-region read replicas.",
    services: ["Amazon EC2", "Auto Scaling", "Amazon VPC", "Amazon Route 53", "Amazon Aurora"],
    githubUrl: "https://github.com/aws-cloud-club/multi-region-dr-stack",
    team: ["DevOps & Cloud Architecture"],
    year: "2025",
  },
  {
    id: "hackathon-greencloud",
    title: "GreenCloud: Carbon Footprint Analyzer",
    category: "hackathon",
    description: "Hackathon winner project: analyzes AWS Cost & Usage Reports (CUR) with Athena and generates optimization recommendations to reduce carbon output.",
    architecture: "AWS Cost & Usage Reports -> S3 Data Lake -> Amazon Athena -> QuickSight & Next.js dashboard.",
    services: ["Amazon Athena", "Amazon S3", "AWS Cost Explorer API", "Amazon QuickSight"],
    liveUrl: "https://greencloud.awsclub.dev",
    githubUrl: "https://github.com/aws-cloud-club/greencloud-analyzer",
    team: ["Hackathon Team Alpha"],
    year: "2026",
  },
]

export function FinderApp() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedProject, setSelectedProject] = useState<ProjectItem>(PROJECTS_DATA[0])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProjects = PROJECTS_DATA.filter(p => {
    const matchesCat = selectedCategory === "all" || p.category === selectedCategory
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.services.some(s => s.toLowerCase().includes(q))
    return matchesCat && matchesSearch
  })

  return (
    <div className="flex h-full w-full flex-col md:flex-row bg-(--win-bg) text-(--os-text)">
      {/* ── Left Finder Sidebar ──────────────────────────────────────────────── */}
      <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-(--win-divider) bg-black/[0.02] dark:bg-white/[0.02] p-3 space-y-4">
        <div>
          <p className="px-2 text-[11px] font-semibold text-(--os-text-dim) uppercase tracking-wider">
            Favorites
          </p>
          <div className="mt-1 space-y-0.5">
            {[
              { id: "all", label: "All Projects", count: PROJECTS_DATA.length },
              { id: "serverless", label: "Serverless & Web", count: 2 },
              { id: "aiml", label: "AI / ML & Bedrock", count: 2 },
              { id: "devops", label: "DevOps & Infra", count: 2 },
              { id: "hackathon", label: "Hackathon Winners", count: 1 },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-(--accent) text-white"
                    : "text-(--os-text) hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder className="size-3.5" />
                  <span>{cat.label}</span>
                </div>
                <span className="text-[10px] opacity-75">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cloud Tags */}
        <div className="hidden md:block">
          <p className="px-2 text-[11px] font-semibold text-(--os-text-dim) uppercase tracking-wider">
            Key Services
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1 px-1">
            {["Lambda", "DynamoDB", "Bedrock", "S3", "Cognito", "EC2"].map(service => (
              <span
                key={service}
                onClick={() => setSearchQuery(service)}
                className="cursor-pointer rounded border border-(--win-divider) bg-black/5 dark:bg-white/5 px-2 py-0.5 text-[10px] font-mono hover:border-(--accent) transition-colors"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Finder Toolbar */}
        <div className="flex items-center justify-between border-b border-(--win-divider) px-4 py-2 bg-(--titlebar-bg)/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-(--os-text)">
              {filteredProjects.length} items
            </span>
            <div className="h-3.5 w-px bg-(--win-divider) mx-1" />
            <div className="flex items-center rounded border border-(--win-divider) p-0.5 bg-black/5 dark:bg-white/5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded ${viewMode === "grid" ? "bg-white dark:bg-neutral-800 shadow-xs" : "opacity-60"}`}
                title="Grid View"
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1 rounded ${viewMode === "list" ? "bg-white dark:bg-neutral-800 shadow-xs" : "opacity-60"}`}
                title="List View"
              >
                <List className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 w-48 sm:w-64">
            <div className="flex items-center gap-1.5 rounded-lg border border-(--win-divider) bg-black/5 dark:bg-white/5 px-2 py-1 w-full text-xs">
              <Search className="size-3 text-(--os-text-dim)" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter files..."
                className="w-full bg-transparent outline-none text-xs"
              />
            </div>
          </div>
        </div>

        {/* Project Items Container */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProjects.map(project => {
                const isSelected = selectedProject.id === project.id
                return (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`group flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-(--accent) bg-(--accent)/10 ring-1 ring-(--accent)"
                        : "border-(--win-divider) bg-black/[0.01] hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="relative size-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-(--accent) mb-2">
                      <Cloud className="size-7" />
                    </div>
                    <span className="text-xs font-semibold text-(--os-text) truncate max-w-full">
                      {project.title}
                    </span>
                    <span className="text-[10px] font-mono text-(--os-text-dim) mt-0.5">
                      {project.year} · {project.services[0]}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="divide-y divide-(--win-divider) border border-(--win-divider) rounded-lg overflow-hidden text-xs">
              {filteredProjects.map(project => {
                const isSelected = selectedProject.id === project.id
                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
                      isSelected ? "bg-(--accent)/15 font-semibold" : "hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Cloud className="size-4 text-(--accent) shrink-0" />
                      <span className="truncate">{project.title}</span>
                    </div>
                    <div className="flex items-center gap-4 text-(--os-text-dim) shrink-0 font-mono text-[11px]">
                      <span>{project.services[0]}</span>
                      <span>{project.year}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Right Inspector Pane ─────────────────────────────────────────────── */}
      {selectedProject && (
        <aside className="w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-(--win-divider) bg-black/[0.01] dark:bg-white/[0.01] p-5 space-y-4 overflow-y-auto">
          <div className="text-center pb-3 border-b border-(--win-divider)">
            <div className="size-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-(--accent) mb-3 shadow-inner">
              <Cloud className="size-9" />
            </div>
            <h3 className="text-sm font-bold text-(--os-text)">{selectedProject.title}</h3>
            <span className="inline-block mt-1 font-mono text-[10px] uppercase tracking-wider text-(--accent) bg-(--accent)/10 px-2 py-0.5 rounded-full">
              {selectedProject.category}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <p className="font-semibold text-(--os-text-dim) uppercase text-[10px] tracking-wider mb-1">
                Overview
              </p>
              <p className="leading-relaxed text-(--os-text)">{selectedProject.description}</p>
            </div>

            <div>
              <p className="font-semibold text-(--os-text-dim) uppercase text-[10px] tracking-wider mb-1">
                Architecture Blueprint
              </p>
              <div className="rounded-lg border border-(--win-divider) bg-black/5 dark:bg-white/5 p-2.5 font-mono text-[11px] leading-relaxed text-(--os-text)">
                {selectedProject.architecture}
              </div>
            </div>

            <div>
              <p className="font-semibold text-(--os-text-dim) uppercase text-[10px] tracking-wider mb-1">
                AWS Services Deployed
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedProject.services.map(svc => (
                  <span
                    key={svc}
                    className="rounded bg-black/5 dark:bg-white/10 px-2 py-0.5 text-[10px] font-mono"
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-(--os-text-dim) uppercase text-[10px] tracking-wider mb-1">
                Builders / Contributor Leads
              </p>
              <p className="text-(--os-text)">{selectedProject.team.join(", ")}</p>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 space-y-2">
              {selectedProject.liveUrl && (
                <button
                  onClick={() => windowActions.open("safari")}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-(--accent) p-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  <Globe className="size-3.5" />
                  <span>Preview in Safari</span>
                </button>
              )}

              {selectedProject.githubUrl && (
                <a
                  href={sanitizeUrl(selectedProject.githubUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-(--win-divider) bg-black/5 dark:bg-white/10 p-2 text-xs font-semibold text-(--os-text) hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
                >
                  <Github className="size-3.5" />
                  <span>View Repository</span>
                </a>
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
