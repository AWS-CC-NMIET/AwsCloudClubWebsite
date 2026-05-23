"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Github, Linkedin, Mail, Users, Loader2 } from "lucide-react"
import { api } from "@/lib/api-client"

interface TeamMember {
  id: string
  name: string
  role: string
  skills: string[]
  bio?: string
  email?: string
  linkedin?: string
  github?: string
  photoUrl?: string
  awsService?: string
  status: "running" | "stopped"
  order: number
}

// ── AWS Service SVG Avatars ──
function AWSServiceAvatar({ service, name }: { service?: string; name: string }) {
  const serviceColors: Record<string, { bg: string; text: string; icon: string }> = {
    "AWS Cloud": { bg: "from-orange-500 to-amber-500", text: "text-white", icon: "cloud" },
    "Amazon EC2": { bg: "from-orange-600 to-amber-600", text: "text-white", icon: "server" },
    "Amazon S3": { bg: "from-red-500 to-orange-500", text: "text-white", icon: "database" },
    "AWS Lambda": { bg: "from-amber-500 to-yellow-500", text: "text-white", icon: "zap" },
    "Amazon DynamoDB": { bg: "from-blue-600 to-cyan-500", text: "text-white", icon: "layers" },
    "Amazon RDS": { bg: "from-blue-500 to-indigo-500", text: "text-white", icon: "cylinder" },
    "AWS Cognito": { bg: "from-purple-600 to-indigo-600", text: "text-white", icon: "shield" },
    "Amazon CloudFront": { bg: "from-cyan-500 to-blue-500", text: "text-white", icon: "globe" },
    "Amazon Route 53": { bg: "from-indigo-600 to-blue-600", text: "text-white", icon: "route" },
    "AWS IAM": { bg: "from-red-600 to-rose-500", text: "text-white", icon: "key" },
    "Amazon ECS": { bg: "from-orange-500 to-red-500", text: "text-white", icon: "box" },
    "Amazon EKS": { bg: "from-orange-600 to-red-600", text: "text-white", icon: "grid" },
    "AWS Amplify": { bg: "from-amber-500 to-orange-500", text: "text-white", icon: "sparkles" },
    "AWS CodePipeline": { bg: "from-rose-500 to-red-500", text: "text-white", icon: "git-commit" },
    "Amazon SageMaker": { bg: "from-teal-500 to-cyan-500", text: "text-white", icon: "cpu" },
    "Amazon EventBridge": { bg: "from-pink-500 to-rose-500", text: "text-white", icon: "activity" },
    "Amazon SNS": { bg: "from-purple-500 to-pink-500", text: "text-white", icon: "bell" },
    "Amazon SQS": { bg: "from-purple-600 to-pink-600", text: "text-white", icon: "mail" },
    "AWS CloudTrail": { bg: "from-blue-600 to-purple-600", text: "text-white", icon: "eye" },
    "Amazon CloudWatch": { bg: "from-emerald-500 to-teal-500", text: "text-white", icon: "gauge" },
    "AWS Secrets Manager": { bg: "from-emerald-600 to-green-500", text: "text-white", icon: "lock" },
    "Amazon VPC": { bg: "from-indigo-500 to-purple-500", text: "text-white", icon: "network" },
    "AWS CloudFormation": { bg: "from-orange-500 to-yellow-500", text: "text-white", icon: "file-code" },
    "Amazon Aurora": { bg: "from-blue-500 to-cyan-400", text: "text-white", icon: "database" },
    "Amazon Redshift": { bg: "from-indigo-600 to-cyan-600", text: "text-white", icon: "bar-chart" },
    "AWS Step Functions": { bg: "from-pink-600 to-purple-600", text: "text-white", icon: "git-merge" },
    "AWS KMS": { bg: "from-rose-600 to-rose-400", text: "text-white", icon: "key" },
  }

  const cleanService = service || "AWS Cloud"
  const conf = serviceColors[cleanService] || serviceColors["AWS Cloud"]

  // Simple SVG representations of AWS services
  const renderSVGIcon = (iconName: string) => {
    switch (iconName) {
      case "cloud":
        return <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.07-1.22.2A5.5 5.5 0 0 0 5 12.5c0 1.25.4 2.4 1.09 3.36A3.5 3.5 0 0 0 9.5 19h8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      case "server":
        return (
          <>
            <rect x="2" y="3" width="20" height="8" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="2" y="13" width="20" height="8" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="6" y1="7" x2="6.01" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="6" y1="17" x2="6.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </>
        )
      case "database":
        return (
          <>
            <ellipse cx="12" cy="5" rx="9" ry="3" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" fill="none" stroke="currentColor" strokeWidth="2" />
          </>
        )
      case "zap":
        return <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      case "layers":
        return (
          <>
            <polygon points="12 2 2 7 12 12 22 7 12 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="2 17 12 22 22 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="2 12 12 17 22 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      case "shield":
        return <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      case "globe":
        return (
          <>
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="none" stroke="currentColor" strokeWidth="2" />
          </>
        )
      case "route":
        return (
          <>
            <circle cx="6" cy="19" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="18" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M9 19h8.5a3.5 3.5 0 0 0 3.5-3.5V9" fill="none" stroke="currentColor" strokeWidth="2" />
          </>
        )
      case "key":
        return <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3-3.5 3.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      case "box":
        return <polygon points="12 2 22 8.5 22 19.5 12 26 2 19.5 2 8.5 12 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      case "grid":
        return <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
      case "lock":
        return (
          <>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" strokeWidth="2" />
          </>
        )
      case "cpu":
        return (
          <>
            <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="9" y="9" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="9" y1="1" x2="9" y2="4" stroke="currentColor" strokeWidth="2" />
            <line x1="15" y1="1" x2="15" y2="4" stroke="currentColor" strokeWidth="2" />
            <line x1="9" y1="20" x2="9" y2="23" stroke="currentColor" strokeWidth="2" />
            <line x1="15" y1="20" x2="15" y2="23" stroke="currentColor" strokeWidth="2" />
            <line x1="20" y1="9" x2="23" y2="9" stroke="currentColor" strokeWidth="2" />
            <line x1="20" y1="15" x2="23" y2="15" stroke="currentColor" strokeWidth="2" />
            <line x1="1" y1="9" x2="4" y2="9" stroke="currentColor" strokeWidth="2" />
            <line x1="1" y1="15" x2="4" y2="15" stroke="currentColor" strokeWidth="2" />
          </>
        )
      case "bell":
        return <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      case "mail":
        return <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      case "eye":
        return (
          <>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
          </>
        )
      case "gauge":
        return (
          <>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="17" r="1" fill="currentColor" />
          </>
        )
      default:
        return <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    }
  }

  return (
    <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${conf.bg} ${conf.text} shadow-xs flex-shrink-0`} title={cleanService}>
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {renderSVGIcon(conf.icon)}
      </svg>
      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-950 border border-white text-[8px] font-bold text-white uppercase" title={cleanService}>
        {cleanService.replace("Amazon ", "").replace("AWS ", "").slice(0, 2)}
      </span>
    </div>
  )
}

// ── Static Team Members ──
const STATIC_MEMBERS: TeamMember[] = [
  {
    id: "m-neha",
    name: "Neha Sharma",
    role: "SBG Leader",
    skills: ["Cloud Architecture", "Leadership", "Organizing"],
    email: "neha48330707@gmail.com",
    github: "https://github.com/neha4833",
    linkedin: "https://www.linkedin.com/in/neha-sharma-sbg",
    awsService: "AWS Cloud",
    status: "running",
    order: 1
  },
  {
    id: "m-sarthakg",
    name: "Sarthak Suhas Godse",
    role: "Tech Team Lead",
    skills: ["AWS", "DevOps", "Infrastructure"],
    email: "sarthakgodse03@gmail.com",
    github: "https://github.com/Sarthak030506",
    linkedin: "https://www.linkedin.com/in/sarthak-godse-7484b4290/",
    awsService: "Amazon EC2",
    status: "running",
    order: 2
  },
  {
    id: "m-kirti",
    name: "Kirti Anil Tambe",
    role: "Design Team Lead",
    skills: ["UI/UX", "Creative Direction", "Figma"],
    email: "kirti.tambe25@gmail.com",
    github: "https://github.com/kirtitambe07",
    linkedin: "https://www.linkedin.com/in/kirti-tambe-2481a832a",
    awsService: "AWS Step Functions",
    status: "running",
    order: 3
  },
  {
    id: "m-rohan",
    name: "Rohan Borude",
    role: "Social Media Head",
    skills: ["Marketing", "Social Media", "Content"],
    email: "rohanbborude09@gmail.com",
    github: "https://github.com/CodexRohan-09",
    linkedin: "https://www.linkedin.com/in/rohan-borude-796625380?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    awsService: "Amazon EKS",
    status: "running",
    order: 4
  },
  {
    id: "m-sanskar",
    name: "Sanskar Ubale",
    role: "Onsite Team Lead",
    skills: ["Logistics", "Operations", "Events"],
    email: "sanskarubale1@gmail.com",
    github: "https://github.com/2823sanskar",
    linkedin: "https://www.linkedin.com/in/sanskar-ubale",
    awsService: "Amazon SQS",
    status: "running",
    order: 5
  },
  {
    id: "m-harshad",
    name: "Harshad Pandurang Kedari",
    role: "Design Team Member",
    skills: ["Creative Design", "Graphics", "Figma"],
    email: "harshadkedari211@gmail.com",
    github: "https://github.com/Harsh-901",
    linkedin: "https://www.linkedin.com/in/harshad-kedari",
    awsService: "Amazon S3",
    status: "running",
    order: 6
  },
  {
    id: "m-snehali",
    name: "Snehali Sudhir Savant",
    role: "Design Team Member",
    skills: ["Graphic Design", "Illustration", "UI"],
    email: "snehalisavant25@gmail.com",
    github: "https://github.com/snehalisavant25",
    linkedin: "https://linkedin.com/in/snehali-savant-4160b232a",
    awsService: "AWS Lambda",
    status: "running",
    order: 7
  },
  {
    id: "m-gayatri",
    name: "Gayatri Trimbak Jadhav",
    role: "Design Team Member",
    skills: ["Visual Design", "UI Design", "Branding"],
    email: "jadhavgayatri401@gmail.com",
    github: "https://github.com/jadhavgayatri25",
    linkedin: "https://www.linkedin.com/in/gayatri-jadhav-805b92331",
    awsService: "Amazon DynamoDB",
    status: "running",
    order: 8
  },
  {
    id: "m-saee",
    name: "Saee Kumbhar",
    role: "Tech Team Member",
    skills: ["Cloud Engineering", "React", "AWS Services"],
    email: "saeeekumbhar@gmail.com",
    github: "https://github.com/saeeekumbhar",
    linkedin: "https://www.linkedin.com/in/saeeekumbhar",
    awsService: "Amazon RDS",
    status: "running",
    order: 9
  },
  {
    id: "m-pranav",
    name: "Pranav Suryawanshi",
    role: "Tech Team Member",
    skills: ["Frontend", "Git", "React"],
    email: "pranavms09@gmail.com",
    github: "https://github.com/Pranavms09",
    linkedin: "https://www.linkedin.com/in/pranavms09/",
    awsService: "Amazon CloudFront",
    status: "running",
    order: 10
  },
  {
    id: "m-prathamesh",
    name: "PRATHAMESH PATIL",
    role: "Tech Team Member",
    skills: ["System Design", "Backend", "Cloud Deployments"],
    email: "prathameshpatil.cse@gmail.com",
    github: "https://github.com/prathamesh-lang",
    linkedin: "https://www.linkedin.com/in/prathamesh-patil-794441385",
    awsService: "AWS IAM",
    status: "running",
    order: 11
  },
  {
    id: "m-prakhar",
    name: "Prakhar Raj",
    role: "Tech Team Member",
    skills: ["Web Dev", "API Integration", "NodeJS"],
    email: "rajprakhar2505@gmail.com",
    github: "https://github.com/rajprakhar07",
    linkedin: "https://www.linkedin.com/in/prakhar-raj25",
    awsService: "Amazon SNS",
    status: "running",
    order: 12
  },
  {
    id: "m-sarthakk",
    name: "Sarthak Sanjay Kandhare",
    role: "Tech Team Member",
    skills: ["AWS Cloud", "Development", "Git"],
    email: "sarthakkandhare5@gmail.com",
    github: "https://github.com/SarthakKandhare03",
    linkedin: "https://www.linkedin.com/in/sarthak-kandhare-898340312?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    awsService: "Amazon SageMaker",
    status: "running",
    order: 13
  },
  {
    id: "m-aayush",
    name: "Aayush Pawar",
    role: "Tech Team Member",
    skills: ["Cloud Fundamentals", "Programming", "AWS"],
    email: "aayush.pawar54321@gmail.com",
    github: "https://github.com/Aayush-Techmaster",
    linkedin: "https://www.linkedin.com/in/aayush-pawar-070387259?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    awsService: "AWS CloudTrail",
    status: "running",
    order: 14
  },
  {
    id: "m-jay",
    name: "Jay Ashok Magar",
    role: "Tech Team Member",
    skills: ["HTML/CSS", "JavaScript", "AWS Services"],
    email: "jaymagar310@gmail.com",
    github: "https://github.com/DevJay067",
    linkedin: "https://www.linkedin.com/in/jay-magar-5ba92b369?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    awsService: "AWS CloudFormation",
    status: "running",
    order: 15
  },
  {
    id: "m-rutvik",
    name: "Rutvik Kale",
    role: "Social Media Team Member",
    skills: ["Content Creation", "Public Relations", "Graphics"],
    email: "rutvikkale2006@gmail.com",
    github: "https://github.com/Ritronn",
    linkedin: "https://www.linkedin.com/in/rutvik-kale-749775286?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    awsService: "AWS Cognito",
    status: "running",
    order: 16
  },
  {
    id: "m-faisal",
    name: "Faisal Momin",
    role: "Social Media Team Member",
    skills: ["Photography", "Content Marketing", "Design"],
    email: "faisalmomin657@gmail.com",
    github: "https://github.com/faisalmomin11-jpg",
    linkedin: "https://www.linkedin.com/in/faisal-momin-080427385?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    awsService: "AWS KMS",
    status: "running",
    order: 17
  },
  {
    id: "m-yuvraj",
    name: "Yuvraj Mathe",
    role: "Event Management Team Member",
    skills: ["Coordination", "Events Management", "Operations"],
    email: "matheyuvraj@gmail.com",
    github: "https://github.com/mYuvraj4118",
    linkedin: "https://www.linkedin.com/in/yuvraj-mathe",
    awsService: "Amazon Route 53",
    status: "running",
    order: 18
  },
  {
    id: "m-nidhi",
    name: "Nidhi Patil",
    role: "Event Management Team Member",
    skills: ["Logistics", "Event Management", "Communication"],
    email: "nidhispatilkv@gmail.com",
    github: "",
    linkedin: "https://www.linkedin.com/in/nidhi-patil-0778673bb",
    awsService: "Amazon ECS",
    status: "running",
    order: 19
  },
  {
    id: "m-fareeha",
    name: "Fareeha Naaz Abdul Khalique Modi",
    role: "Event Team Member",
    skills: ["Teamwork", "Event Planning", "Support"],
    email: "fareehanaaz15@gmail.com",
    github: "https://github.com/Fareeha06-sudo",
    linkedin: "https://www.linkedin.com/in/fareeha-modi-645654397",
    awsService: "AWS Amplify",
    status: "running",
    order: 20
  },
  {
    id: "m-sankalp",
    name: "Sankalp Shinde",
    role: "Event Team Member",
    skills: ["Planning", "Event Logistics", "Onsite Coordination"],
    email: "sankalpshinde1005@gmail.com",
    github: "https://github.com/Sankalp2403",
    linkedin: "https://www.linkedin.com/in/sankalp-shinde-581004395?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    awsService: "AWS Secrets Manager",
    status: "running",
    order: 21
  },
  {
    id: "m-neel",
    name: "NEEL INGALE",
    role: "Onsite Team Member",
    skills: ["Execution", "Operations", "Coordination"],
    email: "neelringale@gmail.com",
    github: "https://github.com/neelringale",
    linkedin: "https://www.linkedin.com/in/neelringale",
    awsService: "Amazon EventBridge",
    status: "running",
    order: 22
  },
  {
    id: "m-pawan",
    name: "Pawan Hatkar",
    role: "Onsite Team Member",
    skills: ["Support", "Execution", "Logistics"],
    email: "pavanhatkar8794@gmail.com",
    github: "https://github.com/pavanhatkar505-coder",
    linkedin: "https://www.linkedin.com/in/pavan-hatkar-2642633b4?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    awsService: "Amazon Aurora",
    status: "running",
    order: 23
  },
  {
    id: "m-ishwari",
    name: "Ishwari Nerkar",
    role: "Design Team Member",
    skills: ["Graphics", "Creative assets", "Social Media Templates"],
    email: "ishwarinerkar1010@gmail.com",
    github: "https://github.com/ishwarinerkar10",
    linkedin: "https://www.linkedin.com/in/ishwari-n-373015348",
    awsService: "AWS CodePipeline",
    status: "running",
    order: 24
  },
  {
    id: "m-kartik",
    name: "Kartik Narkhede",
    role: "Design Team Member",
    skills: ["UI Elements", "Figma", "Branding"],
    email: "kartiknarkhede2007@gmail.com",
    github: "https://github.com/kartik2118-cloud",
    linkedin: "https://www.linkedin.com/in/kartik-narkhede-21kst18/",
    awsService: "Amazon CloudWatch",
    status: "running",
    order: 25
  },
  {
    id: "m-shubham",
    name: "Shubham Ramesh Aute",
    role: "Design Team Member",
    skills: ["Graphics Layout", "Editing", "Visual Assets"],
    email: "shubhamaute101@gmail.com",
    github: "https://github.com/shubhamaute101",
    linkedin: "https://www.linkedin.com/in/shubham-aute-5b97b4385?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    awsService: "Amazon VPC",
    status: "running",
    order: 26
  },
  {
    id: "m-mayur",
    name: "Mayur Patle",
    role: "Design Team Member",
    skills: ["Visual Design", "Branding Asset Creation", "Layouts"],
    email: "patlemayur286@gmail.com",
    github: "https://github.com/git-mayurpatle",
    linkedin: "https://www.linkedin.com/in/mayurnpatle?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    awsService: "Amazon Redshift",
    status: "running",
    order: 27
  }
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 24 } } }

export function TeamApp() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.team.list()
      .then(({ members: m }) => {
        const fetched = m as TeamMember[]
        
        // Merge static members and DB members (avoiding duplicates based on email)
        const combined = [...STATIC_MEMBERS]
        fetched.forEach(dbMember => {
          const isNeha = dbMember.name.trim().toLowerCase() === "neha sharma"
          const isDuplicateEmail = combined.some(sm => sm.email?.trim().toLowerCase() === dbMember.email?.trim().toLowerCase())
          
          if (!isNeha && !isDuplicateEmail) {
            combined.push({
              ...dbMember,
              awsService: dbMember.awsService || "AWS Cloud"
            })
          }
        })

        // Sort by order
        combined.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
        setMembers(combined)
      })
      .catch(() => {
        // Fallback to static list if API fails
        setMembers(STATIC_MEMBERS)
      })
      .finally(() => setLoading(false))
  }, [])

  const runningCount = members.filter((m) => m.status === "running").length

  if (loading) return (
    <div className="flex h-60 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  )

  return (
    <motion.div className="space-y-5 p-1" variants={container} initial="hidden" animate="show">
      
      {/* Cloud instances stats header */}
      <motion.div variants={item} className="bg-white/35 backdrop-blur-sm border border-white/40 shadow-xs rounded-xl p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-indigo-950">Cloud Instances</h2>
            <p className="text-xs text-indigo-950/70 mt-0.5">Our team members powering the AWS Cloud at NMIET</p>
          </div>
          <div className="bg-white/20 border border-white/30 flex items-center gap-2 rounded-lg px-3 py-1.5 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-950/80">{runningCount} Running Profiles</span>
          </div>
        </div>
      </motion.div>

      {/* Roster Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <motion.div
            key={member.id}
            variants={item}
            className="bg-white/35 backdrop-blur-sm border border-white/40 shadow-xs rounded-xl p-5 hover:bg-white/45 transition-all flex flex-col justify-between"
            whileHover={{ y: -3 }}
            transition={{ type: "spring" as const, stiffness: 300 }}
          >
            <div>
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <AWSServiceAvatar service={member.awsService} name={member.name} />
                  <div>
                    <h3 className="font-bold text-sm text-indigo-950 leading-tight">{member.name}</h3>
                    <p className="text-xs font-semibold text-indigo-600/90 mt-0.5">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 capitalize border border-green-500/20">
                  <span className="h-1 w-1 rounded-full bg-green-500" />
                  {member.status}
                </div>
              </div>

              {member.skills?.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {member.skills.map((skill) => (
                    <span key={skill} className="bg-white/25 border border-white/30 rounded-md px-2 py-0.5 text-[10px] font-semibold text-indigo-950/80">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t border-white/30 pt-3 mt-auto">
              {member.github && (
                <motion.a href={member.github} target="_blank" rel="noopener noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 border border-white/30 hover:bg-white/30 text-indigo-950/70"
                  whileHover={{ scale: 1.1, y: -1 }} whileTap={{ scale: 0.95 }}>
                  <Github className="h-3.5 w-3.5" />
                </motion.a>
              )}
              {member.linkedin && (
                <motion.a href={member.linkedin.startsWith("http") ? member.linkedin : `https://${member.linkedin}`} target="_blank" rel="noopener noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 border border-white/30 hover:bg-white/30 text-indigo-950/70"
                  whileHover={{ scale: 1.1, y: -1 }} whileTap={{ scale: 0.95 }}>
                  <Linkedin className="h-3.5 w-3.5" />
                </motion.a>
              )}
              {member.email && (
                <motion.a href={`mailto:${member.email}`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 border border-white/30 hover:bg-white/30 text-indigo-950/70"
                  whileHover={{ scale: 1.1, y: -1 }} whileTap={{ scale: 0.95 }}>
                  <Mail className="h-3.5 w-3.5" />
                </motion.a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
