"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BookOpen, Video, FileText, Code, ExternalLink, Star, Loader2,
  Folder, CornerDownRight, ArrowLeft, File 
} from "lucide-react"
import { api } from "@/lib/api-client"

interface Resource {
  id: string
  name: string
  category: string
  type: "Course" | "Video" | "Document" | "Tool"
  url: string
  featured: boolean
  order: number
}

// Icon helper based on type
const getFileIcon = (type: string, className = "h-4 w-4") => {
  if (type === "Course")   return <BookOpen className={className} />
  if (type === "Video")    return <Video className={className} />
  if (type === "Document") return <FileText className={className} />
  return <Code className={className} />
}

// Extension helper based on type
const getFileExtension = (type: string) => {
  if (type === "Course")   return ".epub"
  if (type === "Video")    return ".mp4"
  if (type === "Document") return ".pdf"
  return ".exe"
}

// Visual color theme config based on type
const getTypeColorConfig = (type: string) => {
  if (type === "Course")   return { bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500/20" }
  if (type === "Video")    return { bg: "bg-indigo-500",  text: "text-indigo-500",  border: "border-indigo-500/20" }
  if (type === "Document") return { bg: "bg-red-500",     text: "text-red-500",     border: "border-red-500/20" }
  return { bg: "bg-amber-500",    text: "text-amber-500",    border: "border-amber-500/20" }
}

const FALLBACK_RESOURCES: Resource[] = [
  // Getting Started
  { id: "fb-1",  name: "AWS Cloud Practitioner Essentials",  category: "Getting Started",  type: "Course",   url: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/", featured: true,  order: 1  },
  { id: "fb-2",  name: "AWS Free Tier Overview",             category: "Getting Started",  type: "Document", url: "https://aws.amazon.com/free/",                                              featured: false, order: 2  },
  { id: "fb-3",  name: "AWS Skill Builder",                  category: "Getting Started",  type: "Course",   url: "https://skillbuilder.aws/",                                                featured: true,  order: 3  },
  { id: "fb-4",  name: "AWS re:Post Community",              category: "Getting Started",  type: "Document", url: "https://repost.aws/",                                                      featured: false, order: 4  },
  // Certifications
  { id: "fb-5",  name: "Cloud Practitioner Exam Guide",      category: "Certifications",   type: "Document", url: "https://d1.awsstatic.com/training-and-certification/docs-cloud-practitioner/AWS-Certified-Cloud-Practitioner_Exam-Guide.pdf", featured: true,  order: 5  },
  { id: "fb-6",  name: "AWS Training & Certification",       category: "Certifications",   type: "Course",   url: "https://aws.amazon.com/training/",                                         featured: false, order: 6  },
  { id: "fb-7",  name: "Solutions Architect – Associate",    category: "Certifications",   type: "Document", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", featured: true, order: 7 },
  // Hands-on Labs
  { id: "fb-8",  name: "AWS Workshops (workshops.aws)",      category: "Hands-on Labs",    type: "Tool",     url: "https://workshops.aws/",                                                   featured: true,  order: 8  },
  { id: "fb-9",  name: "AWS Samples on GitHub",              category: "Hands-on Labs",    type: "Tool",     url: "https://github.com/aws-samples",                                           featured: false, order: 9  },
  { id: "fb-10", name: "AWS CDK Workshop",                   category: "Hands-on Labs",    type: "Tool",     url: "https://cdkworkshop.com/",                                                 featured: false, order: 10 },
  { id: "fb-11", name: "AWS Jam (Challenge Labs)",           category: "Hands-on Labs",    type: "Tool",     url: "https://jam.awsevents.com/",                                               featured: false, order: 11 },
  // Official Docs
  { id: "fb-12", name: "AWS Documentation Hub",             category: "Official Docs",     type: "Document", url: "https://docs.aws.amazon.com/",                                             featured: false, order: 12 },
  { id: "fb-13", name: "AWS Architecture Center",           category: "Official Docs",     type: "Document", url: "https://aws.amazon.com/architecture/",                                     featured: true,  order: 13 },
  { id: "fb-14", name: "Well-Architected Framework",        category: "Official Docs",     type: "Document", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html", featured: false, order: 14 },
  // Video Learning
  { id: "fb-15", name: "AWS Official YouTube Channel",      category: "Video Learning",    type: "Video",    url: "https://www.youtube.com/@amazonwebservices",                               featured: true,  order: 15 },
  { id: "fb-16", name: "freeCodeCamp AWS Full Course",      category: "Video Learning",    type: "Video",    url: "https://www.youtube.com/watch?v=NhDYbskXRgc",                             featured: false, order: 16 },
  { id: "fb-17", name: "AWS re:Invent Session Playlist",   category: "Video Learning",    type: "Video",    url: "https://www.youtube.com/c/amazonwebservices/playlists",                    featured: false, order: 17 },
]

export function ResourcesApp() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading]     = useState(true)
  const [selectedFolder, setSelectedFolder] = useState<string>("All")
  const [activeResource, setActiveResource] = useState<Resource | null>(null)
  // mobile: "grid" shows file grid, "folders" shows sidebar folder list
  const [mobileView, setMobileView] = useState<"grid" | "folders">("grid")

  useEffect(() => {
    api.resources.list()
      .then(({ resources: r }) => {
        const dbResources = (r as Resource[]).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        setResources(dbResources.length > 0 ? dbResources : FALLBACK_RESOURCES)
      })
      .catch(() => {
        setResources(FALLBACK_RESOURCES)
      })
      .finally(() => setLoading(false))
  }, [])

  // Get unique categories dynamically from resource data
  const categories = Array.from(new Set(resources.map((r) => r.category)))

  // Filter resources by selected folder
  const filteredResources = resources.filter((r) => {
    if (selectedFolder === "All") return true
    return r.category === selectedFolder
  })

  if (loading) return (
    <div className="flex h-60 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#6B4FE8" }} />
    </div>
  )

  return (
    <div className="flex h-full flex-col md:flex-row gap-4 p-1 overflow-hidden" style={{ minHeight: "520px" }}>
      {/* ── Left Sidebar (Folders Navigator) ── */}
      <div className={`w-full md:w-56 flex-shrink-0 flex flex-col gap-3 ${
        activeResource ? "hidden md:flex" : mobileView === "folders" ? "flex" : "hidden md:flex"
      }`}>
        {/* Current Path Header */}
        <div className="bg-white/30 backdrop-blur-xs border border-white/40 shadow-2xs rounded-xl p-3">
          <p className="text-[10px] font-bold text-indigo-950/50 uppercase tracking-wider px-2 mb-2">Cloud Resources</p>
          <div className="flex items-center gap-2 px-2 py-1 bg-white/20 border border-white/30 rounded-lg text-indigo-950 text-xs font-semibold">
            <CornerDownRight className="h-3 w-3 text-indigo-950/60" />
            <span className="truncate">/root/resources/{selectedFolder.toLowerCase().replace(/\s+/g, "-")}</span>
          </div>
        </div>

        {/* Folders List */}
        <div className="bg-white/35 backdrop-blur-xs border border-white/40 shadow-xs rounded-xl p-2 flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          <p className="text-[9px] font-bold text-indigo-950/40 uppercase tracking-wider px-2.5 py-1.5">Folders</p>
          
          {/* All Resources Folder */}
          <button
            onClick={() => {
              setSelectedFolder("All")
              setActiveResource(null)
              setMobileView("grid")
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all text-xs ${
              selectedFolder === "All" 
                ? "bg-[#6B4FE8] text-white shadow-xs font-semibold" 
                : "text-indigo-950 hover:bg-white/25"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Folder className={`h-4 w-4 flex-shrink-0 ${selectedFolder === "All" ? "text-white" : "text-[#6B4FE8]"}`} />
              <span className="truncate">All Resources</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedFolder === "All" ? "bg-white/20 text-white" : "bg-indigo-950/5 text-indigo-950/50"}`}>
              {resources.length}
            </span>
          </button>

          {/* Dynamic Category Folders */}
          {categories.map((category) => {
            const isSelected = selectedFolder === category
            const count = resources.filter((r) => r.category === category).length
            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedFolder(category)
                  setActiveResource(null)
                  setMobileView("grid")
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all text-xs ${
                  isSelected 
                    ? "bg-[#6B4FE8] text-white shadow-xs font-semibold" 
                    : "text-indigo-950 hover:bg-white/25"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Folder className={`h-4 w-4 flex-shrink-0 ${isSelected ? "text-white" : "text-[#6B4FE8]"}`} />
                  <span className="truncate">{category}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-indigo-950/5 text-indigo-950/50"}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main Area (Grid / Document Previewer) ── */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white/35 backdrop-blur-xs border border-white/40 shadow-xs rounded-xl overflow-hidden ${
        activeResource || mobileView === "grid" ? "flex" : "hidden md:flex"
      }`}>
        <AnimatePresence mode="wait">
          {!activeResource ? (
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
                  {/* Mobile: Folders toggle button */}
                  <button
                    onClick={() => setMobileView("folders")}
                    className="md:hidden flex items-center gap-1 text-[10px] font-bold text-indigo-950 bg-white/40 border border-white/50 rounded-lg px-2 py-1 mr-1 hover:bg-white/60 transition-all"
                  >
                    <Folder className="h-3 w-3" />
                    <span>Folders</span>
                  </button>
                  <BookOpen className="h-4 w-4 text-[#6B4FE8]" />
                  <h3 className="text-xs font-semibold text-indigo-950 truncate">
                    {selectedFolder === "All" ? "All Resources" : selectedFolder}
                  </h3>
                </div>
                <span className="text-[10px] text-indigo-950/50 bg-white/30 px-2 py-0.5 rounded border border-white/20">
                  {filteredResources.length} items
                </span>
              </div>

              {/* Grid content */}
              <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                {filteredResources.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 opacity-40">
                    <BookOpen className="h-10 w-10 text-[#6B4FE8] mb-2" />
                    <p className="text-xs font-medium text-indigo-950">Folder is empty</p>
                  </div>
                ) : (
                  <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 justify-items-center">
                    {filteredResources.map((res) => {
                      const ext = getFileExtension(res.type)
                      const colors = getTypeColorConfig(res.type)
                      return (
                        <motion.div
                          key={res.id}
                          onClick={() => setActiveResource(res)}
                          className="flex flex-col items-center gap-1.5 cursor-pointer select-none group"
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {/* File representation card */}
                          <div className="relative w-24 h-32 bg-white/95 rounded-lg border border-slate-200 shadow-xs group-hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
                            {/* Dog-ear corner */}
                            <div className="absolute top-0 right-0 w-4 h-4 bg-slate-100 border-l border-b border-slate-300 rounded-bl-sm" />
                            <div className="absolute top-0 right-0 w-0 h-0 border-t-4 border-r-4 border-t-white border-r-white" />

                            {/* Resource Type Badge */}
                            <div className="p-2 flex flex-col items-start gap-1">
                              <div className={`${colors.bg} rounded px-1.5 py-0.5 text-[7px] font-extrabold text-white leading-none uppercase flex items-center gap-0.5`}>
                                {getFileIcon(res.type, "h-2 w-2")}
                                <span>{res.type}</span>
                              </div>
                              <div className="w-12 h-1 bg-slate-200 rounded-full mt-1.5" />
                              <div className="w-16 h-1 bg-slate-200 rounded-full" />
                            </div>

                            {/* Featured Indicator Star */}
                            {res.featured && (
                              <div className="absolute top-1.5 right-6">
                                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                              </div>
                            )}

                            {/* Center Icon Graphic */}
                            <div className="flex justify-center items-center h-8 text-slate-300 group-hover:text-slate-400 transition-colors">
                              {getFileIcon(res.type, "h-8 w-8 opacity-40")}
                            </div>

                            {/* Extension bottom label banner */}
                            <div className={`bg-slate-800 text-[8px] font-bold text-slate-200 py-1 px-1.5 text-center tracking-tight truncate w-full`}>
                              {res.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}{ext}
                            </div>
                          </div>

                          {/* Label under icon */}
                          <div className="text-center max-w-[100px]">
                            <p className="text-xs font-semibold truncate" style={{ color: "#1E1060" }}>
                              {res.name}
                            </p>
                            <p className="text-[10px]" style={{ color: "#9B8FC8" }}>
                              {res.type}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* ── RESOURCE PREVIEW READER VIEW ── */
            <motion.div
              key="resource-reader"
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
                    onClick={() => setActiveResource(null)} 
                    className="flex items-center gap-1 text-xs font-bold text-indigo-950 bg-white/40 border border-white/50 rounded-lg px-2 py-1 mr-1 hover:bg-white/60 transition-all"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                  {getFileIcon(activeResource.type, `h-4 w-4 ${getTypeColorConfig(activeResource.type).text}`)}
                  <h3 className="text-xs font-semibold text-indigo-950 truncate">
                    {activeResource.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}{getFileExtension(activeResource.type)}
                  </h3>
                </div>
                
                {/* Launch Action */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <a 
                    href={activeResource.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#6B4FE8] px-3 py-1.5 rounded-lg hover:bg-[#5B3FD8] transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open Link</span>
                  </a>
                </div>
              </div>

              {/* Resource Document Sheet Canvas */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-indigo-950/5 custom-scrollbar flex justify-center">
                <div className="bg-white border border-slate-200 shadow-sm rounded-xs p-6 md:p-8 max-w-2xl w-full flex flex-col font-serif text-slate-800 relative select-text" style={{ minHeight: "580px" }}>
                  
                  {/* Document Header */}
                  <div className="text-[9px] font-sans font-bold text-slate-400 tracking-widest uppercase border-b border-slate-100 pb-2.5 mb-5 flex justify-between">
                    <span>AWS STUDENT BUILDER GROUP NMIET</span>
                    <span>STUDY CARD RESOURCE</span>
                  </div>

                  {/* Resource Title Header */}
                  <div className="mb-4">
                    <h1 className="text-xl font-bold text-slate-900 mb-1 leading-tight tracking-tight uppercase">
                      EDUCATION RESOURCE: {activeResource.name}
                    </h1>
                    <p className="text-[10px] text-slate-400 font-sans italic font-medium">
                      Cloud Learning Material · ID: SBG-RES-{activeResource.id.slice(0,6).toUpperCase()}
                    </p>
                  </div>

                  {/* Metadata Block */}
                  <div className="grid grid-cols-2 border border-slate-200 rounded-sm font-sans text-xs bg-slate-50/50 mb-5">
                    <div className="p-2.5 border-r border-b border-slate-200">
                      <span className="text-[10px] block text-slate-400 font-bold uppercase">Learning Category</span>
                      <span className="font-semibold text-slate-800">{activeResource.category}</span>
                    </div>
                    <div className="p-2.5 border-b border-slate-200">
                      <span className="text-[10px] block text-slate-400 font-bold uppercase">Resource Format</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                        {getFileIcon(activeResource.type, `h-3.5 w-3.5 ${getTypeColorConfig(activeResource.type).text}`)}
                        {activeResource.type}
                      </span>
                    </div>
                    <div className="p-2.5 border-r border-slate-200">
                      <span className="text-[10px] block text-slate-400 font-bold uppercase">Recommended Status</span>
                      <span className="font-semibold text-slate-800">
                        {activeResource.featured ? "★ Highly Recommended / Featured" : "Standard Resource"}
                      </span>
                    </div>
                    <div className="p-2.5">
                      <span className="text-[10px] block text-slate-400 font-bold uppercase">File Extension</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {getFileExtension(activeResource.type)}
                      </span>
                    </div>
                  </div>

                  {/* Separator Line */}
                  <div className="border-b-2 border-slate-900 mb-5" />

                  {/* Section 1: Overview */}
                  <div className="mb-6">
                    <h2 className="text-xs font-sans font-bold text-slate-900 tracking-wide uppercase mb-2">
                      1. Description & Learning Context
                    </h2>
                    <p className="text-xs md:text-sm leading-relaxed text-slate-700 font-sans pl-1.5">
                      This educational document contains learning materials curated specifically to prepare you for building on the Amazon Web Services cloud platform. 
                      Whether you are aiming for AWS Certifications or developing skills for hackathons, study these core topics carefully.
                    </p>
                  </div>

                  {/* Section 2: Direct Resource Access */}
                  <div className="mb-6 mt-auto flex flex-col items-center border-2 border-dashed border-slate-200 bg-slate-50 p-6 rounded-sm text-center">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[#6B4FE8]/10 text-[#6B4FE8] mb-3">
                      {getFileIcon(activeResource.type, "h-5 w-5")}
                    </div>
                    <h3 className="text-xs font-sans font-bold text-slate-800 mb-1">
                      Ready to Launch {activeResource.type}
                    </h3>
                    <p className="text-[11px] font-sans text-slate-400 max-w-sm mb-4">
                      Click the button below to launch the material directly in a new browser tab.
                    </p>
                    <a 
                      href={activeResource.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#6B4FE8] px-4 py-2 rounded shadow-xs hover:bg-[#5B3FD8] transition-all"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Launch External Resource</span>
                    </a>
                  </div>

                  {/* Document Footer */}
                  <div className="mt-auto border-t border-slate-100 pt-3 text-center font-sans text-[9px] text-slate-400 flex justify-between items-center">
                    <span>AWS Student Builder Group Resource Center</span>
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
