// components/apps/appstore-app.tsx
// macOS App Store for AWS developer starter kits, CDK templates, and CLI tools

"use client"

import React, { useState } from "react"
import { Download, Check, Star, ExternalLink, Sparkles, Terminal, Code2, Box } from "lucide-react"
import { sanitizeUrl } from "@/lib/utils"

interface StoreApp {
  id: string
  name: string
  category: string
  stars: number
  description: string
  version: string
  githubUrl: string
  installed?: boolean
}

const APPS_LIST: StoreApp[] = [
  {
    id: "cdk-starter",
    name: "AWS CDK Production Stack",
    category: "DevOps & Infrastructure",
    stars: 48,
    description: "Production-ready AWS CDK TypeScript boilerplate with pre-configured VPC, ECS Fargate, and CI/CD pipelines.",
    version: "v2.12.0",
    githubUrl: "https://github.com/aws-cloud-club/aws-cdk-starter",
  },
  {
    id: "serverless-sam",
    name: "Serverless SAM Boilerplate",
    category: "Serverless Architecture",
    stars: 62,
    description: "Clean serverless microservice template with AWS SAM, DynamoDB single-table schema, and Node.js 20 Lambdas.",
    version: "v1.8.4",
    githubUrl: "https://github.com/aws-cloud-club/serverless-sam-template",
  },
  {
    id: "bedrock-rag",
    name: "Bedrock RAG Starter Kit",
    category: "Generative AI",
    stars: 84,
    description: "Connect Claude 3.5 Sonnet on AWS Bedrock to OpenSearch Serverless vector database with Python and LangChain.",
    version: "v1.2.0",
    githubUrl: "https://github.com/aws-cloud-club/bedrock-rag-starter",
  },
  {
    id: "cost-guardian",
    name: "CloudWatch Cost Guardian",
    category: "Security & Cost",
    stars: 35,
    description: "Lightweight Lambda function checking AWS Budgets every morning and sending Discord / Slack notifications.",
    version: "v1.0.1",
    githubUrl: "https://github.com/aws-cloud-club/cost-guardian",
  },
]

export function AppStoreApp() {
  const [installedMap, setInstalledMap] = useState<Record<string, boolean>>({})

  const handleInstall = (id: string) => {
    setInstalledMap(prev => ({ ...prev, [id]: true }))
  }

  return (
    <div className="flex h-full w-full flex-col bg-(--win-bg) text-(--os-text) overflow-y-auto">
      {/* ── Store Banner ────────────────────────────────────────────────────── */}
      <div className="border-b border-(--win-divider) bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent p-6 md:p-8">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-(--accent) uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            <span>AWS SBG NMIET Developer Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-(--os-text)">
            Free Open Source Starter Packs
          </h1>
          <p className="text-xs md:text-sm text-(--os-text-dim) leading-relaxed">
            Engineered by student leads and club contributors. Clone, fork, and deploy directly to
            your AWS Free Tier account.
          </p>
        </div>
      </div>

      {/* ── Apps Grid ────────────────────────────────────────────────────────── */}
      <div className="p-6 md:p-8">
        <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-(--accent) mb-4">
          Featured Starter Repositories
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {APPS_LIST.map(app => {
            const isInstalled = installedMap[app.id]

            return (
              <div
                key={app.id}
                className="flex flex-col justify-between rounded-xl border border-(--win-divider) bg-black/[0.01] dark:bg-white/[0.02] p-5 space-y-4 hover:border-(--accent)/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-(--os-text)">{app.name}</h3>
                      <p className="text-[11px] text-(--os-text-dim)">{app.category}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-mono text-amber-500">
                      <Star className="size-3 fill-amber-500" /> {app.stars}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-(--os-text-dim)">{app.description}</p>
                </div>

                <div className="flex items-center justify-between border-t border-(--win-divider) pt-3 text-xs">
                  <span className="font-mono text-[11px] text-(--os-text-dim)">{app.version}</span>

                  <div className="flex items-center gap-2">
                    <a
                      href={sanitizeUrl(app.githubUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded text-(--os-text-dim) hover:text-(--os-text)"
                      title="GitHub"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>

                    <button
                      onClick={() => handleInstall(app.id)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1 font-semibold text-xs transition-colors ${
                        isInstalled
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-black/10 dark:bg-white/15 text-(--os-text) hover:bg-(--accent) hover:text-white"
                      }`}
                    >
                      {isInstalled ? (
                        <>
                          <Check className="size-3" />
                          <span>Installed</span>
                        </>
                      ) : (
                        <span>GET</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
