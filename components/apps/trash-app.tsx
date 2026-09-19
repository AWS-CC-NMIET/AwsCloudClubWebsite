// components/apps/trash-app.tsx
// Cloud anti-patterns rejected by AWS Cloud Club builders

"use client"

import React, { useState } from "react"
import { Trash2, AlertTriangle, ShieldCheck, Check, Sparkles } from "lucide-react"
import { systemActions } from "@/lib/aws-store"

interface AntiPattern {
  id: string
  mistake: string
  whyRejected: string
  bestPractice: string
}

const ANTI_PATTERNS: AntiPattern[] = [
  {
    id: "ap-1",
    mistake: "Hardcoding AWS Access Keys directly into Git repos",
    whyRejected: "GitHub bots scrape public keys in minutes, leading to compromised accounts and massive unauthorized billing.",
    bestPractice: "Always use IAM Roles with temporary STS credentials or AWS Secrets Manager.",
  },
  {
    id: "ap-2",
    mistake: "Leaving S3 Buckets publicly readable with sensitive data",
    whyRejected: "Unrestricted S3 permissions lead to accidental data breaches and leaked student information.",
    bestPractice: "Enable S3 Block Public Access at the account level and use IAM bucket policies.",
  },
  {
    id: "ap-3",
    mistake: "Running production apps on a single EC2 with no backups",
    whyRejected: "Zero resilience. Any hardware degradation or AZ outage crashes your entire production service.",
    bestPractice: "Deploy across multiple Availability Zones with Auto Scaling Groups and automated EBS snapshots.",
  },
  {
    id: "ap-4",
    mistake: "Zero CloudWatch budget alarms or cost limits",
    whyRejected: "A runaway loop in Lambda or misconfigured NAT gateway can burn hundreds of dollars overnight.",
    bestPractice: "Set AWS Budgets with email alerts at 50%, 80%, and 100% of planned monthly spend.",
  },
  {
    id: "ap-5",
    mistake: "Granting wildcard AdministratorAccess to all team members",
    whyRejected: "Violates the principle of least privilege. Any compromised student laptop has full root cloud control.",
    bestPractice: "Attach scoped IAM permission boundaries tailored specifically to project roles.",
  },
]

export function TrashApp() {
  const [items, setItems] = useState<AntiPattern[]>(ANTI_PATTERNS)
  const [selected, setSelected] = useState<AntiPattern>(ANTI_PATTERNS[0])

  const handleEmptyTrash = () => {
    setItems([])
    systemActions.showToast("🗑️ All bad practices permanently deleted! Cloud posture: 100%")
  }

  return (
    <div className="flex h-full w-full flex-col md:flex-row bg-(--win-bg) text-(--os-text)">
      {/* ── Left Trash Items List ────────────────────────────────────────────── */}
      <aside className="w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-(--win-divider) bg-black/[0.02] dark:bg-white/[0.02] p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-(--win-divider)">
          <div className="flex items-center gap-2">
            <Trash2 className="size-4 text-rose-500" />
            <h2 className="text-sm font-bold text-(--os-text)">Rejected Cloud Practices</h2>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              className="text-[11px] font-medium text-rose-500 hover:underline"
            >
              Empty Bin
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-10 text-xs text-(--os-text-dim)">
            <p className="font-semibold text-emerald-500">Trash is Empty!</p>
            <p className="mt-1">Zero anti-patterns detected in your architecture.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => {
              const isSelected = selected?.id === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`flex w-full flex-col rounded-xl p-3 text-left transition-all border ${
                    isSelected
                      ? "border-rose-500/50 bg-rose-500/10"
                      : "border-(--win-divider) hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2 text-rose-500">
                    <AlertTriangle className="size-3.5 shrink-0" />
                    <span className="truncate text-xs font-semibold">{item.mistake}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </aside>

      {/* ── Right Solution Inspector ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        {selected && items.length > 0 ? (
          <div className="max-w-xl space-y-5">
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold text-rose-500 uppercase tracking-wider">
                Anti-Pattern Rejected
              </span>
              <h1 className="text-xl font-bold text-(--os-text)">{selected.mistake}</h1>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-1.5 text-xs text-rose-700 dark:text-rose-300">
              <p className="font-semibold">Why this was rejected:</p>
              <p className="leading-relaxed">{selected.whyRejected}</p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2 text-xs text-emerald-700 dark:text-emerald-300">
              <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-4" />
                <span>The AWS Well-Architected Solution:</span>
              </div>
              <p className="leading-relaxed text-(--os-text)">{selected.bestPractice}</p>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-(--os-text-dim)">
            <span>Select an item on the left to inspect architectural details.</span>
          </div>
        )}
      </main>
    </div>
  )
}
