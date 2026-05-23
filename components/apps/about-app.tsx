"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, Image as ImageIcon, Video, FileDown, 
  Play, Pause, Volume2, Maximize, Calendar, Globe, 
  Target, Eye, Award, Heart, Sparkles, ChevronRight, CornerDownRight 
} from "lucide-react"
import { useMeetup } from "@/lib/meetup-context"

type FileId = "intro" | "mission" | "vision" | "whatwedo" | "values"

interface FileItem {
  id: FileId
  name: string
  type: string
  size: string
  icon: any
  color: string
}

const FILES: FileItem[] = [
  { id: "intro", name: "Introduction.rtf", type: "Rich Text Document", size: "1.8 KB", icon: FileText, color: "text-blue-500" },
  { id: "mission", name: "Our_Mission.png", type: "Portable Network Graphic", size: "542 KB", icon: ImageIcon, color: "text-emerald-500" },
  { id: "vision", name: "Our_Vision.mp4", type: "MPEG-4 Video", size: "12.4 MB", icon: Video, color: "text-purple-500" },
  { id: "whatwedo", name: "What_We_Do.pdf", type: "PDF Document", size: "3.1 MB", icon: FileDown, color: "text-rose-500" },
  { id: "values", name: "Core_Values.txt", type: "Plain Text Document", size: "382 B", icon: FileText, color: "text-amber-500" },
]

export function AboutApp() {
  const { memberCount } = useMeetup()
  const [selectedFileId, setSelectedFileId] = useState<FileId>("intro")
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [mobileActiveView, setMobileActiveView] = useState<FileId | null>(null)

  const selectedFile = FILES.find((f) => f.id === selectedFileId) || FILES[0]

  return (
    <div className="flex h-full flex-col md:flex-row gap-4 p-1 overflow-hidden" style={{ minHeight: "520px" }}>
      {/* ── File Explorer Sidebar (Desktop) / Files List (Mobile) ── */}
      <div className={`w-full md:w-60 flex-shrink-0 flex flex-col gap-3 ${mobileActiveView ? "hidden md:flex" : "flex"}`}>
        <div className="bg-white/30 backdrop-blur-sm border border-white/40 shadow-2xs rounded-xl p-3">
          <p className="text-[10px] font-bold text-indigo-950/50 uppercase tracking-wider px-2 mb-2">Cloud Storage</p>
          <div className="flex items-center gap-2 px-2 py-1 bg-white/20 border border-white/30 rounded-lg text-indigo-950 text-xs font-semibold">
            <CornerDownRight className="h-3 w-3 text-indigo-950/60" />
            <span>/root/about_us</span>
          </div>
        </div>

        <div className="bg-white/35 backdrop-blur-sm border border-white/40 shadow-xs rounded-xl p-2 flex-1 flex flex-col gap-1 overflow-y-auto">
          {FILES.map((file) => {
            const Icon = file.icon
            const isSelected = selectedFileId === file.id
            return (
              <button
                key={file.id}
                onClick={() => {
                  setSelectedFileId(file.id)
                  setMobileActiveView(file.id)
                  if (file.id !== "vision") setIsVideoPlaying(false)
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all ${
                  isSelected 
                    ? "bg-indigo-600 text-white shadow-xs font-semibold" 
                    : "text-indigo-950 hover:bg-white/25 hover:text-indigo-950"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${isSelected ? "text-white" : file.color}`} />
                  <div className="truncate">
                    <p className="text-xs leading-none truncate">{file.name}</p>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? "text-white/70" : "text-indigo-950/50"}`}>{file.size}</p>
                  </div>
                </div>
                <ChevronRight className={`h-3 w-3 opacity-60 ${isSelected ? "text-white" : "text-indigo-950/40"}`} />
              </button>
            )
          })}
        </div>
      </div>

      {/* ── File Preview Area (Desktop) / Active View Overlay (Mobile) ── */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white/35 backdrop-blur-sm border border-white/40 shadow-xs rounded-xl overflow-hidden ${
        mobileActiveView ? "flex" : "hidden md:flex"
      }`}>
        {/* Preview Header */}
        <div className="flex items-center justify-between border-b border-white/30 bg-white/20 px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <selectedFile.icon className={`h-4 w-4 ${selectedFile.color}`} />
            <h3 className="text-xs font-semibold text-indigo-950 truncate">
              Preview — {selectedFile.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-indigo-950/50 bg-white/30 px-2 py-0.5 rounded border border-white/20">
              {selectedFile.type}
            </span>
            <button 
              onClick={() => {
                setMobileActiveView(null)
                setIsVideoPlaying(false)
              }} 
              className="md:hidden text-xs font-bold text-indigo-600 bg-white/35 border border-white/40 rounded-lg px-2.5 py-1"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Live Preview Screen */}
        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedFileId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col"
            >
              {/* ── RTF DOCUMENT VIEW ── */}
              {selectedFileId === "intro" && (
                <div className="flex-1 flex flex-col bg-white border border-white/60 shadow-xs rounded-lg p-6 max-w-2xl mx-auto w-full">
                  <div className="border-b border-indigo-950/10 pb-4 mb-4 text-center">
                    <h1 className="text-xl font-bold text-indigo-950 leading-tight">
                      AWS Student Builder Group at NMIET
                    </h1>
                    <p className="text-[10px] font-semibold text-indigo-950/50 mt-1 uppercase tracking-wider">
                      RTF Version 1.0 · Official Document
                    </p>
                  </div>
                  <div className="flex-1 text-sm text-indigo-950/80 space-y-4 leading-relaxed font-sans">
                    <p>
                      Welcome to the **AWS Student Builder Group** at Nutan Maharashtra Institute of Engineering and Technology (NMIET), Talegaon, Pune.
                    </p>
                    <p>
                      We teach students about the AWS Cloud and its various use cases — including security,
                      AI, business analytics, and business transformation. Our hands-on approach bridges
                      the gap between academic learning and real-world cloud careers.
                    </p>
                    <p>
                      Whether you are an absolute beginner looking to understand what the cloud is, or an advanced builder preparing for AWS certifications, we provide a collaborative community to support your cloud journey.
                    </p>
                  </div>
                  <div className="mt-6 border-t border-indigo-950/5 pt-4 flex flex-wrap gap-4 items-center justify-between text-[11px] text-indigo-950/50">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Founded Feb 16, 2026</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      <span>AWS SBG Global Chapter</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PNG IMAGE VIEW ── */}
              {selectedFileId === "mission" && (
                <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
                  <div className="relative w-full rounded-xl overflow-hidden border border-white/50 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-indigo-950/5 p-8 shadow-xs flex flex-col items-center text-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent)]" />
                    
                    <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md mb-5">
                      <Target className="h-8 w-8 animate-pulse" />
                    </div>
                    
                    <h2 className="relative z-10 text-lg font-bold text-indigo-950">OUR MISSION</h2>
                    <div className="relative z-10 w-10 h-1 bg-emerald-500 rounded-full mt-2 mb-4" />
                    
                    <p className="relative z-10 text-sm leading-relaxed text-indigo-950/85 font-medium max-w-md">
                      "To democratize cloud computing education at NMIET — empowering every student with the practical AWS skills needed to build scalable, innovative solutions. We learn by doing: every session involves real AWS accounts, real deployments, real impact."
                    </p>
                    
                    <div className="absolute bottom-2 right-3 text-[9px] font-bold text-indigo-950/30">
                      Our_Mission.png (542 x 380)
                    </div>
                  </div>
                </div>
              )}

              {/* ── MP4 VIDEO VIEW ── */}
              {selectedFileId === "vision" && (
                <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-indigo-950/20 bg-indigo-950 shadow-md group flex flex-col items-center justify-between p-4">
                    {/* Simulated Background Stream */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-purple-950/80 to-indigo-900/60 opacity-90" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.4))]" />
                    
                    {/* Floating AWS Nodes overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-16 pointer-events-none opacity-20">
                      <div className="w-12 h-12 rounded-full border border-purple-500 animate-ping" />
                      <div className="w-8 h-8 rounded-full border border-blue-400 animate-pulse" />
                    </div>

                    {/* Top bar */}
                    <div className="relative z-10 w-full flex items-center justify-between text-white/60 text-[10px] font-mono">
                      <span>00:16 / 02:40</span>
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        1080P HD
                      </span>
                    </div>

                    {/* Mid screen content */}
                    <div className="relative z-10 text-center px-6">
                      <AnimatePresence mode="wait">
                        {!isVideoPlaying ? (
                          <motion.button
                            onClick={() => setIsVideoPlaying(true)}
                            className="h-14 w-14 flex items-center justify-center rounded-full bg-white/95 text-indigo-950 shadow-md mx-auto mb-3"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Play className="h-6 w-6 fill-current ml-1" />
                          </motion.button>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-3 py-4"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 mx-auto">
                              <Eye className="h-5 w-5" />
                            </div>
                            <h3 className="text-white text-xs font-bold tracking-wider uppercase">Our Vision</h3>
                            <p className="text-xs md:text-sm text-purple-100/90 leading-relaxed font-sans max-w-sm mx-auto font-medium">
                              To become the most active student-driven cloud community in Maharashtra — producing AWS-certified, industry-ready professionals.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {!isVideoPlaying && (
                        <p className="text-[11px] text-white/50 uppercase tracking-widest font-bold font-sans">Play Vision Video</p>
                      )}
                    </div>

                    {/* Video Player controls */}
                    <div className="relative z-10 w-full flex items-center gap-3 bg-black/40 backdrop-blur-md rounded-lg p-2 text-white">
                      <button onClick={() => setIsVideoPlaying(!isVideoPlaying)} className="hover:text-purple-400 transition-colors">
                        {isVideoPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                      </button>
                      
                      {/* Playbar */}
                      <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer relative">
                        <div className="absolute top-0 left-0 bottom-0 bg-purple-500 rounded-full" style={{ width: isVideoPlaying ? "35%" : "10%" }} />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-white/80" />
                        <Maximize className="h-4 w-4 text-white/80" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PDF DOCUMENT VIEW ── */}
              {selectedFileId === "whatwedo" && (
                <div className="flex-1 flex flex-col bg-white border border-white/60 shadow-xs rounded-lg p-5 max-w-2xl mx-auto w-full">
                  <div className="flex items-center justify-between border-b border-indigo-950/10 pb-3 mb-4 text-indigo-950">
                    <span className="text-[10px] font-bold tracking-wider uppercase bg-indigo-50 px-2 py-1 rounded">PDF Preview: page 1 of 1</span>
                    <span className="text-xs font-semibold">What We Do</span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 text-indigo-950">
                    {[
                      { title: "Workshops & Training",  desc: "Hands-on AWS sessions — EC2, Lambda, S3, DynamoDB, IAM, and more. Real accounts, real infrastructure.", icon: Award,  color: "#6B4FE8" },
                      { title: "Community Events",      desc: "Introductory sessions, networking meetups, guest lectures from AWS professionals and cloud experts.", icon: Target, color: "#FF9900" },
                      { title: "Certification Prep",    desc: "Collaborative study groups for AWS Cloud Practitioner, Solutions Architect, and Developer exams.", icon: Heart,  color: "#E85580" },
                      { title: "Cloud Projects",        desc: "Building and deploying real AWS-powered projects that solve actual problems for students and the campus.", icon: Eye,    color: "#5BA8D8" },
                    ].map((card) => (
                      <div
                        key={card.title}
                        className="bg-indigo-50/40 border border-indigo-100 rounded-lg p-3.5"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg mb-2" style={{ background: `${card.color}15` }}>
                          <card.icon className="h-4 w-4" style={{ color: card.color }} />
                        </div>
                        <h4 className="text-xs font-bold mb-1">{card.title}</h4>
                        <p className="text-[11px] leading-relaxed text-indigo-950/70">{card.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TXT PLAIN TEXT VIEW ── */}
              {selectedFileId === "values" && (
                <div className="flex-1 flex flex-col bg-[#1A1A24] border border-white/10 shadow-xs rounded-lg p-4 font-mono text-xs max-w-xl mx-auto w-full text-slate-300">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3 text-slate-400">
                    <span>Core_Values.txt</span>
                    <span className="text-[10px]">UTF-8 Text</span>
                  </div>
                  
                  {/* Line Editor Simulator */}
                  <div className="flex-1 flex gap-3 select-none leading-relaxed">
                    <div className="text-right text-slate-600 pr-2 border-r border-white/5 flex flex-col gap-0.5">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                      <span>6</span>
                      <span>7</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5 text-slate-300">
                      <p className="text-indigo-400 font-bold"># AWS Student Builder Group Values</p>
                      <p></p>
                      <p><span className="text-amber-500 font-bold">1. INNOVATION</span> - Pushing boundaries with creative cloud solutions on real AWS infrastructure.</p>
                      <p><span className="text-amber-500 font-bold">2. COMMUNITY</span> - Open to all — {memberCount ?? 299} members and growing across Maharashtra.</p>
                      <p><span className="text-amber-500 font-bold">3. EXCELLENCE</span> - Official AWS Student Builder Group, held to AWS global standards.</p>
                      <p></p>
                      <p className="text-slate-600">~ [End of File]</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Quick preview stats */}
          <div className="mt-4 border-t border-white/30 pt-3 flex flex-wrap items-center justify-between text-[10px] text-indigo-950/60 flex-shrink-0">
            <span>Selected item: {selectedFile.name} ({selectedFile.size})</span>
            <span>Index: {FILES.indexOf(selectedFile) + 1} / {FILES.length} files</span>
          </div>
        </div>
      </div>
    </div>
  )
}
