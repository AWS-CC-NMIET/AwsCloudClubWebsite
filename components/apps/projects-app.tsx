"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Github, ExternalLink, X, FolderOpen, Loader2,
  Folder, FileText, CornerDownRight, ArrowLeft, Star, File 
} from "lucide-react"
import { api } from "@/lib/api-client"

interface Project {
  id: string
  title: string
  description: string
  stack: string[]
  author: string
  status: "Production" | "Development" | "Beta"
  githubUrl?: string
  liveUrl?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

const statusConfig: Record<string, { bg: string; color: string }> = {
  Production:  { bg: "rgba(80,200,138,0.12)",  color: "#3AAA72" },
  Development: { bg: "rgba(255,153,0,0.12)",   color: "#E88800" },
  Beta:        { bg: "rgba(91,168,216,0.12)",  color: "#4A90C0" },
}

export function ProjectsApp() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading]   = useState(true)
  const [selectedFolder, setSelectedFolder] = useState<string>("All") // "All" | "Production" | "Development" | "Beta"
  const [activeProject, setActiveProject]   = useState<Project | null>(null)

  useEffect(() => {
    api.projects.list()
      .then(({ projects: p }) => setProjects(p as Project[]))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Filter projects by selected folder category
  const filteredProjects = projects.filter((p) => {
    if (selectedFolder === "All") return true
    return p.status === selectedFolder
  })

  if (loading) return (
    <div className="flex h-60 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#6B4FE8" }} />
    </div>
  )

  return (
    <div className="flex h-full flex-col md:flex-row gap-4 p-1 overflow-hidden" style={{ minHeight: "520px" }}>
      {/* ── Left Sidebar (Folders Navigator) ── */}
      <div className={`w-full md:w-56 flex-shrink-0 flex flex-col gap-3 ${activeProject ? "hidden md:flex" : "flex"}`}>
        {/* Current Path Header */}
        <div className="bg-white/30 backdrop-blur-xs border border-white/40 shadow-2xs rounded-xl p-3">
          <p className="text-[10px] font-bold text-indigo-950/50 uppercase tracking-wider px-2 mb-2">Workspace Storage</p>
          <div className="flex items-center gap-2 px-2 py-1 bg-white/20 border border-white/30 rounded-lg text-indigo-950 text-xs font-semibold">
            <CornerDownRight className="h-3 w-3 text-indigo-950/60" />
            <span>/root/projects/{selectedFolder.toLowerCase()}</span>
          </div>
        </div>

        {/* Folders List */}
        <div className="bg-white/35 backdrop-blur-xs border border-white/40 shadow-xs rounded-xl p-2 flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          <p className="text-[9px] font-bold text-indigo-950/40 uppercase tracking-wider px-2.5 py-1.5">Folders</p>
          {[
            { id: "All", label: "All Projects", count: projects.length },
            { id: "Production", label: "Production", count: projects.filter(p => p.status === "Production").length },
            { id: "Beta", label: "Beta", count: projects.filter(p => p.status === "Beta").length },
            { id: "Development", label: "Development", count: projects.filter(p => p.status === "Development").length },
          ].map((folder) => {
            const isSelected = selectedFolder === folder.id
            return (
              <button
                key={folder.id}
                onClick={() => {
                  setSelectedFolder(folder.id)
                  setActiveProject(null)
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all text-xs ${
                  isSelected 
                    ? "bg-[#6B4FE8] text-white shadow-xs font-semibold" 
                    : "text-indigo-950 hover:bg-white/25"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Folder className={`h-4 w-4 flex-shrink-0 ${isSelected ? "text-white" : "text-[#6B4FE8]"}`} />
                  <span className="truncate">{folder.label}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-indigo-950/5 text-indigo-950/50"}`}>
                  {folder.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main Area (Grid / Document Previewer) ── */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white/35 backdrop-blur-xs border border-white/40 shadow-xs rounded-xl overflow-hidden ${
        activeProject ? "flex" : "hidden md:flex"
      }`}>
        <AnimatePresence mode="wait">
          {!activeProject ? (
            /* ── FOLDER GRID VIEW ── */
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/30 bg-white/20 px-4 py-3 flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <FolderOpen className="h-4 w-4 text-[#6B4FE8]" />
                  <h3 className="text-xs font-semibold text-indigo-950 truncate">
                    Showcase — {selectedFolder === "All" ? "All Projects" : `${selectedFolder} Folder`}
                  </h3>
                </div>
                <span className="text-[10px] text-indigo-950/50 bg-white/30 px-2 py-0.5 rounded border border-white/20">
                  {filteredProjects.length} items
                </span>
              </div>

              {/* Grid content */}
              <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                {filteredProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 opacity-40">
                    <FolderOpen className="h-10 w-10 text-[#6B4FE8] mb-2" />
                    <p className="text-xs font-medium text-indigo-950">Folder is empty</p>
                  </div>
                ) : (
                  <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 justify-items-center">
                    {filteredProjects.map((project) => (
                      <motion.div
                        key={project.id}
                        onClick={() => setActiveProject(project)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer select-none group"
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {/* File Card representation (Enlarged, no screenshot thumbnail inside card) */}
                        <div className="relative w-32 h-44 bg-white/95 rounded-lg border border-slate-200 shadow-xs group-hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
                          {/* Dog-ear corner */}
                          <div className="absolute top-0 right-0 w-5 h-5 bg-slate-100 border-l border-b border-slate-300 rounded-bl-sm" />
                          <div className="absolute top-0 right-0 w-0 h-0 border-t-5 border-r-5 border-t-white border-r-white" />

                          {/* PDF Badge Icon */}
                          <div className="p-3 flex flex-col items-start gap-1">
                            <div className="bg-red-500 rounded px-1.5 py-0.5 text-[9px] font-extrabold text-white leading-none uppercase">
                              PDF
                            </div>
                            <div className="w-16 h-1 bg-slate-200 rounded-full mt-2" />
                            <div className="w-20 h-1 bg-slate-200 rounded-full" />
                            <div className="w-12 h-1 bg-slate-200 rounded-full" />
                          </div>

                          {/* Large PDF Icon Symbol in Center */}
                          <div className="flex justify-center items-center h-14 text-red-500/80 group-hover:text-red-600 transition-colors">
                            <FileText className="h-12 w-12" />
                          </div>

                          {/* Red banner at bottom */}
                          <div className="bg-red-600 text-[9px] font-bold text-white py-1.5 px-2 text-center tracking-tight truncate w-full">
                            {project.title.toLowerCase().replace(/\s+/g, "-")}.pdf
                          </div>
                        </div>

                        {/* Label under icon */}
                        <div className="text-center max-w-[130px]">
                          <p className="text-xs font-semibold truncate" style={{ color: "#1E1060" }}>
                            {project.title}
                          </p>
                          <p className="text-[10px]" style={{ color: "#9B8FC8" }}>
                            by {project.author}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* ── PDF DOCUMENT READER VIEW ── */
            <motion.div
              key="pdf-reader"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              {/* Reader Toolbar */}
              <div className="flex items-center justify-between border-b border-white/30 bg-[#1E1060]/10 px-4 py-2.5 flex-shrink-0 text-indigo-950">
                <div className="flex items-center gap-2 min-w-0">
                  <button 
                    onClick={() => setActiveProject(null)} 
                    className="flex items-center gap-1 text-xs font-bold text-indigo-950 bg-white/40 border border-white/50 rounded-lg px-2 py-1 mr-1 hover:bg-white/60 transition-all"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                  <FileText className="h-4 w-4 text-red-500" />
                  <h3 className="text-xs font-semibold text-indigo-950 truncate">
                    {activeProject.title.toLowerCase().replace(/\s+/g, "-")}.pdf
                  </h3>
                </div>
                
                {/* External Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {activeProject.githubUrl && (
                    <a 
                      href={activeProject.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1 text-[10px] font-semibold text-white bg-indigo-950 px-2 py-1 rounded hover:bg-indigo-900 transition-all"
                    >
                      <Github className="h-3 w-3" />
                      <span>Code</span>
                    </a>
                  )}
                  {activeProject.liveUrl && (
                    <a 
                      href={activeProject.liveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1 text-[10px] font-semibold text-white bg-[#6B4FE8] px-2 py-1 rounded hover:bg-[#5B3FD8] transition-all"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Demo</span>
                    </a>
                  )}
                </div>
              </div>

              {/* PDF Document Canvas */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-indigo-950/5 custom-scrollbar flex justify-center">
                <div className="bg-white border border-slate-200 shadow-sm rounded-xs p-6 md:p-8 max-w-2xl w-full flex flex-col font-serif text-slate-800 relative select-text" style={{ minHeight: "680px" }}>
                  
                  {/* PDF Document Header */}
                  <div className="text-[9px] font-sans font-bold text-slate-400 tracking-widest uppercase border-b border-slate-100 pb-2.5 mb-5 flex justify-between">
                    <span>AWS STUDENT BUILDER GROUP NMIET</span>
                    <span>TECHNICAL SPECIFICATION REPORT</span>
                  </div>

                  {/* Document Title Header */}
                  <div className="mb-4">
                    <h1 className="text-2xl font-bold text-slate-900 mb-1 leading-tight tracking-tight uppercase">
                      PROJECT REPORT: {activeProject.title}
                    </h1>
                    <p className="text-[10px] text-slate-400 font-sans italic font-medium">
                      AWS Cloud Club Project Showcase Series · Doc ID: SBG-PRJ-{activeProject.id.slice(0,6).toUpperCase()}
                    </p>
                  </div>

                  {/* Metadata Block */}
                  <div className="grid grid-cols-2 border border-slate-200 rounded-sm font-sans text-xs bg-slate-50/50 mb-5">
                    <div className="p-2.5 border-r border-b border-slate-200">
                      <span className="text-[10px] block text-slate-400 font-bold uppercase">Principal Developer</span>
                      <span className="font-semibold text-slate-800">{activeProject.author}</span>
                    </div>
                    <div className="p-2.5 border-b border-slate-200">
                      <span className="text-[10px] block text-slate-400 font-bold uppercase">Release Status</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                        <span className="h-2 w-2 rounded-full" style={{ background: (statusConfig[activeProject.status] || statusConfig.Development).color }} />
                        {activeProject.status}
                      </span>
                    </div>
                    <div className="p-2.5 border-r border-slate-200">
                      <span className="text-[10px] block text-slate-400 font-bold uppercase">Report Date</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(activeProject.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <div className="p-2.5">
                      <span className="text-[10px] block text-slate-400 font-bold uppercase">Repository Status</span>
                      <span className="font-semibold text-slate-800 truncate">
                        {activeProject.githubUrl ? "Open Source (GitHub)" : "Internal Use"}
                      </span>
                    </div>
                  </div>

                  {/* Separator Line */}
                  <div className="border-b-2 border-slate-900 mb-5" />

                  {/* Section 1: Executive Summary */}
                  <div className="mb-5">
                    <h2 className="text-xs font-sans font-bold text-slate-900 tracking-wide uppercase mb-2">
                      1. Executive Summary
                    </h2>
                    <p className="text-xs md:text-sm leading-relaxed text-slate-700 font-sans whitespace-pre-line pl-1.5">
                      {activeProject.description}
                    </p>
                  </div>

                  {/* Section 2: Technical Specifications */}
                  <div className="mb-5">
                    <h2 className="text-xs font-sans font-bold text-slate-900 tracking-wide uppercase mb-2">
                      2. System Architecture & Tech Stack
                    </h2>
                    <p className="text-xs leading-relaxed text-slate-600 font-sans mb-3 pl-1.5">
                      The core software components, integration layers, and developer tools powering this system include:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pl-1.5 font-sans">
                      {activeProject.stack.map((tech) => (
                        <span 
                          key={tech} 
                          className="bg-slate-100 border border-slate-300 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Section 3: Visual Reference (Image Screenshot) */}
                  {activeProject.imageUrl && (
                    <div className="mb-6 mt-2 flex flex-col items-center bg-slate-50 p-3 border border-slate-100 rounded-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={activeProject.imageUrl} 
                        alt={activeProject.title} 
                        className="max-h-60 w-full object-cover rounded-xs border border-slate-200" 
                      />
                      <span className="text-[10px] font-sans font-medium text-slate-400 italic mt-2">
                        Figure 1: Project visual representation and implementation screenshot.
                      </span>
                    </div>
                  )}

                  {/* Document Footer */}
                  <div className="mt-auto border-t border-slate-100 pt-3 text-center font-sans text-[9px] text-slate-400 flex justify-between items-center">
                    <span>AWS Student Builder Group Showcase</span>
                    <span>Page 1 of 1</span>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
