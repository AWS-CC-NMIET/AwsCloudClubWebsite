// components/apps/terminal-app.tsx
// Interactive cloud terminal with AWS CLI and club commands

"use client"

import React, { useState, useRef, useEffect } from "react"
import { windowActions, systemActions } from "@/lib/aws-store"

interface TerminalHistoryItem {
  command: string
  output: string | React.ReactNode
}

export function TerminalApp() {
  const [history, setHistory] = useState<TerminalHistoryItem[]>([
    {
      command: "welcome",
      output: (
        <div className="space-y-1">
          <p className="text-[#c084fc] font-bold">AWS SBG NMIET Shell v2.4 (x86_64-aws-cloud)</p>
          <p className="text-neutral-400 text-xs">
            Type <span className="text-[#c084fc] font-bold">&apos;help&apos;</span> to see available cloud commands.
          </p>
        </div>
      ),
    },
  ])
  const [inputVal, setInputVal] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history])

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputVal.trim()
    if (!trimmed) return

    const lower = trimmed.toLowerCase()
    let output: React.ReactNode = ""

    if (lower === "help") {
      output = (
        <div className="space-y-1 text-neutral-300 text-xs">
          <p className="font-bold text-[#c084fc]">Available commands:</p>
          <p><span className="text-emerald-400">aws --version</span> - Show AWS CLI & Cloud credentials</p>
          <p><span className="text-emerald-400">team</span> - List core student leadership team</p>
          <p><span className="text-emerald-400">events</span> - Show upcoming workshops and hackathons</p>
          <p><span className="text-emerald-400">projects</span> - Display deployed cloud architectures</p>
          <p><span className="text-emerald-400">certs</span> - View certification preparation roadmaps</p>
          <p><span className="text-emerald-400">neofetch</span> - Display AWS SBG NMIET system specs</p>
          <p><span className="text-emerald-400">theme [dark|light]</span> - Switch OS appearance</p>
          <p><span className="text-emerald-400">sudo admin</span> - Launch authenticated admin panel</p>
          <p><span className="text-emerald-400">clear</span> - Clear terminal screen</p>
        </div>
      )
    } else if (lower === "clear") {
      setHistory([])
      setInputVal("")
      return
    } else if (lower === "aws --version") {
      output = "aws-cli/2.17.40 Python/3.11.8 Linux/6.6.137 botocore/2.4.40 (us-east-1)"
    } else if (lower === "team") {
      output = (
        <div className="space-y-0.5 text-xs text-neutral-300">
          <p className="text-[#c084fc] font-bold">AWS SBG NMIET Leadership:</p>
          <p>• Chapter Lead: Omkar Rane (AWS Community Builder)</p>
          <p>• Cloud Architecture Lead: Pranav Joshi</p>
          <p>• AI / ML Domain Lead: Sneha Deshmukh</p>
          <p>• Serverless & Web Lead: Aditya Sharma</p>
          <p>• DevOps Lead: Rohit Verma</p>
        </div>
      )
    } else if (lower === "events") {
      output = "Next workshop: AWS GenAI & Bedrock Bootcamp (Sep 28, 2026, 2:00 PM IST). Type 'open calendar' to view."
    } else if (lower === "projects") {
      output = "Active Repos: Campus Serverless Portal, Cloud Resume Challenge, Bedrock AI Assistant, Rekognition Attendance."
    } else if (lower === "certs") {
      output = "Active Study Tracks: CLF-C02 (Cloud Practitioner), SAA-C03 (Solutions Architect Associate)."
    } else if (lower === "neofetch") {
      output = (
        <div className="font-mono text-xs text-neutral-300 space-y-1">
          <p className="text-[#c084fc] font-bold">AWS SBG NMIET Chapter</p>
          <p>----------------------------</p>
          <p><span className="text-[#c084fc]">OS:</span> AWS Cloud OS / macOS Ventura Hybrid</p>
          <p><span className="text-[#c084fc]">Host:</span> Amazon Web Services (us-east-1)</p>
          <p><span className="text-[#c084fc]">Kernel:</span> Next.js 16.2 · React 19.2</p>
          <p><span className="text-[#c084fc]">Uptime:</span> 99.99% Serverless Uptime</p>
          <p><span className="text-amber-300">Shell:</span> sbg-bash 5.2</p>
          <p><span className="text-amber-300">Auth:</span> Amazon Cognito User Pool</p>
          <p><span className="text-amber-300">Database:</span> Amazon DynamoDB On-Demand</p>
        </div>
      )
    } else if (lower === "sudo admin" || lower === "admin") {
      windowActions.open("admin")
      output = "Launching AWS Cloud Club Admin Panel..."
    } else if (lower === "theme dark") {
      systemActions.setAppearance("dark")
      output = "Appearance switched to Dark mode."
    } else if (lower === "theme light") {
      systemActions.setAppearance("light")
      output = "Appearance switched to Light mode."
    } else if (lower.startsWith("open ")) {
      const app = lower.replace("open ", "") as any
      windowActions.open(app)
      output = `Launching ${app}...`
    } else {
      output = `Command not recognized: ${trimmed}. Type 'help' for a list of commands.`
    }

    setHistory(prev => [...prev, { command: trimmed, output }])
    setInputVal("")
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="h-full w-full bg-[#121216] p-4 font-mono text-xs text-neutral-100 overflow-y-auto cursor-text select-text"
    >
      <div className="space-y-3">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">sbg@aws-cloud-club:~$</span>
              <span className="text-white">{item.command}</span>
            </div>
            <div className="text-neutral-300 pl-2">{item.output}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleCommand} className="mt-3 flex items-center gap-2">
        <span className="text-emerald-400 shrink-0">sbg@aws-cloud-club:~$</span>
        <input
          ref={inputRef}
          autoFocus
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          className="flex-1 bg-transparent text-white outline-none font-mono text-xs"
        />
      </form>
      <div ref={bottomRef} />
    </div>
  )
}
