// lib/club-content.ts
// Real AWS Student Builder Group NMIET content — the single source of truth for
// everything static on the site (migrated verbatim from commit 4c899fc).

export const CLUB = {
  name: "AWS Student Builder Group",
  shortName: "AWS SBG NMIET",
  chapter: "NMIET Chapter",
  college: "Nutan Maharashtra Institute of Engineering and Technology",
  collegeShort: "NMIET",
  city: "Talegaon, Pune",
  address: "NMIET Campus, Talegaon Dabhade\nPune, Maharashtra 410507",
  founded: "February 16, 2026",
  foundedShort: "Feb 16, 2026",
  leader: "Neha Sharma",
  email: "aws.studentbuildersgroup.nmiet@gmail.com",
  tagline:
    "Empowering the next generation of cloud innovators through hands-on learning, real-world projects, and a thriving community.",
  meetupUrl: "https://www.meetup.com/aws-sbg-at-nutan-maharashtra-inst-of-engineering-and-tech/",
  youtubeUrl: "https://www.youtube.com/@AWSStudentBuildersGroupNMIET",
  discordUrl: "https://discord.gg/BydTcjm8g",
  region: "ap-south-1 (Mumbai)",
  /** Shown until the live Meetup count loads (or if Meetup is unreachable). */
  fallbackMemberCount: 299,
} as const

export type PillarIcon = "cloud" | "rocket" | "sparkles"

export const WHAT_WE_DO: { title: string; description: string; color: string; icon: PillarIcon }[] = [
  {
    title: "Learn",
    description: "Hands-on workshops and deep-dive sessions on AWS services — EC2, Lambda, S3, DynamoDB and more.",
    color: "#6B4FE8",
    icon: "cloud",
  },
  {
    title: "Build",
    description: "Real-world cloud projects that solve actual problems. Build, deploy, and scale on AWS infrastructure.",
    color: "#FF9900",
    icon: "rocket",
  },
  {
    title: "Connect",
    description: "Network with industry professionals, AWS heroes, and peers who share your passion for cloud.",
    color: "#50C88A",
    icon: "sparkles",
  },
]

export const HIGHLIGHTS = [
  "Official AWS Student Builder Group — est. February 2026",
  "299+ Members on Meetup & Growing",
  "Part of AWS Student Builder Groups Global Network",
  "236+ RSVPs for Our Very First Event",
]

export const ABOUT = {
  introTitle: "AWS Student Builder Group at NMIET",
  intro: [
    "Welcome to the AWS Student Builder Group at Nutan Maharashtra Institute of Engineering and Technology (NMIET), Talegaon, Pune.",
    "We teach students about the AWS Cloud and its various use cases — including security, AI, business analytics, and business transformation. Our hands-on approach bridges the gap between academic learning and real-world cloud careers.",
    "Whether you are an absolute beginner looking to understand what the cloud is, or an advanced builder preparing for AWS certifications, we provide a collaborative community to support your cloud journey.",
  ],
  mission:
    "To democratize cloud computing education at NMIET — empowering every student with the practical AWS skills needed to build scalable, innovative solutions. We learn by doing: every session involves real AWS accounts, real deployments, real impact.",
  vision:
    "To become the most active student-driven cloud community in Maharashtra — producing AWS-certified, industry-ready professionals.",
  whatWeDo: [
    { title: "Workshops & Training", desc: "Hands-on AWS sessions — EC2, Lambda, S3, DynamoDB, IAM, and more. Real accounts, real infrastructure.", color: "#6B4FE8" },
    { title: "Community Events", desc: "Introductory sessions, networking meetups, guest lectures from AWS professionals and cloud experts.", color: "#FF9900" },
    { title: "Certification Prep", desc: "Collaborative study groups for AWS Cloud Practitioner, Solutions Architect, and Developer exams.", color: "#E85580" },
    { title: "Cloud Projects", desc: "Building and deploying real AWS-powered projects that solve actual problems for students and the campus.", color: "#5BA8D8" },
  ],
  values: [
    { name: "INNOVATION", text: "Pushing boundaries with creative cloud solutions on real AWS infrastructure." },
    { name: "COMMUNITY", text: "Open to all — {members} members and growing across Maharashtra." },
    { name: "EXCELLENCE", text: "Official AWS Student Builder Group, held to AWS global standards." },
  ],
}

export const OFFICE_HOURS = [
  { day: "Mon – Fri", time: "10:00 AM – 6:00 PM" },
  { day: "Saturday", time: "12:00 PM – 4:00 PM" },
  { day: "Sunday", time: "Closed" },
]

// ── Team ──────────────────────────────────────────────────────────────────────

export type TeamGroup = "Leadership" | "Tech" | "Design" | "Social Media" | "Events" | "Onsite" | "Members"

export const TEAM_GROUPS: TeamGroup[] = ["Leadership", "Tech", "Design", "Social Media", "Events", "Onsite", "Members"]

export interface TeamMember {
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

const LEADERSHIP_ROLES = /\b(leader|lead|head)\b/i

export function teamGroupOf(role: string): TeamGroup {
  if (LEADERSHIP_ROLES.test(role)) return "Leadership"
  if (/tech/i.test(role)) return "Tech"
  if (/design/i.test(role)) return "Design"
  if (/social/i.test(role)) return "Social Media"
  if (/event/i.test(role)) return "Events"
  if (/onsite/i.test(role)) return "Onsite"
  return "Members"
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "m-neha", name: "Neha Sharma", role: "SBG Leader", skills: ["Cloud Architecture", "Leadership", "Organizing"], email: "neha48330707@gmail.com", github: "https://github.com/neha4833", linkedin: "https://www.linkedin.com/in/neha-sharma-sbg", awsService: "AWS Cloud", status: "running", order: 1 },
  { id: "m-sarthakg", name: "Sarthak Suhas Godse", role: "Tech Team Lead", skills: ["AWS", "DevOps", "Infrastructure"], email: "sarthakgodse03@gmail.com", github: "https://github.com/Sarthak030506", linkedin: "https://www.linkedin.com/in/sarthak-godse-7484b4290/", awsService: "Amazon EC2", status: "running", order: 2 },
  { id: "m-kirti", name: "Kirti Anil Tambe", role: "Design Team Lead", skills: ["UI/UX", "Creative Direction", "Figma"], email: "kirti.tambe25@gmail.com", github: "https://github.com/kirtitambe07", linkedin: "https://www.linkedin.com/in/kirti-tambe-2481a832a", awsService: "AWS Step Functions", status: "running", order: 3 },
  { id: "m-rohan", name: "Rohan Borude", role: "Social Media Head", skills: ["Marketing", "Social Media", "Content"], email: "rohanbborude09@gmail.com", github: "https://github.com/CodexRohan-09", linkedin: "https://www.linkedin.com/in/rohan-borude-796625380?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", awsService: "Amazon EKS", status: "running", order: 4 },
  { id: "m-sanskar", name: "Sanskar Ubale", role: "Onsite Team Lead", skills: ["Logistics", "Operations", "Events"], email: "sanskarubale1@gmail.com", github: "https://github.com/2823sanskar", linkedin: "https://www.linkedin.com/in/sanskar-ubale", awsService: "Amazon SQS", status: "running", order: 5 },
  { id: "m-harshad", name: "Harshad Pandurang Kedari", role: "Design Team Member", skills: ["Creative Design", "Graphics", "Figma"], email: "harshadkedari211@gmail.com", github: "https://github.com/Harsh-901", linkedin: "https://www.linkedin.com/in/harshad-kedari", awsService: "Amazon S3", status: "running", order: 6 },
  { id: "m-snehali", name: "Snehali Sudhir Savant", role: "Design Team Member", skills: ["Graphic Design", "Illustration", "UI"], email: "snehalisavant25@gmail.com", github: "https://github.com/snehalisavant25", linkedin: "https://linkedin.com/in/snehali-savant-4160b232a", awsService: "AWS Lambda", status: "running", order: 7 },
  { id: "m-gayatri", name: "Gayatri Trimbak Jadhav", role: "Design Team Member", skills: ["Visual Design", "UI Design", "Branding"], email: "jadhavgayatri401@gmail.com", github: "https://github.com/jadhavgayatri25", linkedin: "https://www.linkedin.com/in/gayatri-jadhav-805b92331", awsService: "Amazon DynamoDB", status: "running", order: 8 },
  { id: "m-saee", name: "Saee Kumbhar", role: "Tech Team Member", skills: ["Cloud Engineering", "React", "AWS Services"], email: "saeeekumbhar@gmail.com", github: "https://github.com/saeeekumbhar", linkedin: "https://www.linkedin.com/in/saeeekumbhar", awsService: "Amazon RDS", status: "running", order: 9 },
  { id: "m-pranav", name: "Pranav Suryawanshi", role: "Tech Team Member", skills: ["Frontend", "Git", "React"], email: "pranavms09@gmail.com", github: "https://github.com/Pranavms09", linkedin: "https://www.linkedin.com/in/pranavms09/", awsService: "Amazon CloudFront", status: "running", order: 10 },
  { id: "m-prathamesh", name: "PRATHAMESH PATIL", role: "Tech Team Member", skills: ["System Design", "Backend", "Cloud Deployments"], email: "prathameshpatil.cse@gmail.com", github: "https://github.com/prathamesh-lang", linkedin: "https://www.linkedin.com/in/prathamesh-patil-794441385", awsService: "AWS IAM", status: "running", order: 11 },
  { id: "m-prakhar", name: "Prakhar Raj", role: "Tech Team Member", skills: ["Web Dev", "API Integration", "NodeJS"], email: "rajprakhar2505@gmail.com", github: "https://github.com/rajprakhar07", linkedin: "https://www.linkedin.com/in/prakhar-raj25", awsService: "Amazon SNS", status: "running", order: 12 },
  { id: "m-sarthakk", name: "Sarthak Sanjay Kandhare", role: "Tech Team Member", skills: ["AWS Cloud", "Development", "Git"], email: "sarthakkandhare5@gmail.com", github: "https://github.com/SarthakKandhare03", linkedin: "https://www.linkedin.com/in/sarthak-kandhare-898340312?utm_source=share_via&utm_content=profile&utm_medium=member_ios", awsService: "Amazon SageMaker", status: "running", order: 13 },
  { id: "m-aayush", name: "Aayush Pawar", role: "Tech Team Member", skills: ["Cloud Fundamentals", "Programming", "AWS"], email: "aayush.pawar54321@gmail.com", github: "https://github.com/Aayush-Techmaster", linkedin: "https://www.linkedin.com/in/aayush-pawar-070387259?utm_source=share_via&utm_content=profile&utm_medium=member_ios", awsService: "AWS CloudTrail", status: "running", order: 14 },
  { id: "m-jay", name: "Jay Ashok Magar", role: "Tech Team Member", skills: ["HTML/CSS", "JavaScript", "AWS Services"], email: "jaymagar310@gmail.com", github: "https://github.com/DevJay067", linkedin: "https://www.linkedin.com/in/jay-magar-5ba92b369?utm_source=share_via&utm_content=profile&utm_medium=member_android", awsService: "AWS CloudFormation", status: "running", order: 15 },
  { id: "m-rutvik", name: "Rutvik Kale", role: "Social Media Team Member", skills: ["Content Creation", "Public Relations", "Graphics"], email: "rutvikkale2006@gmail.com", github: "https://github.com/Ritronn", linkedin: "https://www.linkedin.com/in/rutvik-kale-749775286?utm_source=share_via&utm_content=profile&utm_medium=member_android", awsService: "AWS Cognito", status: "running", order: 16 },
  { id: "m-faisal", name: "Faisal Momin", role: "Social Media Team Member", skills: ["Photography", "Content Marketing", "Design"], email: "faisalmomin657@gmail.com", github: "https://github.com/faisalmomin11-jpg", linkedin: "https://www.linkedin.com/in/faisal-momin-080427385?utm_source=share_via&utm_content=profile&utm_medium=member_android", awsService: "AWS KMS", status: "running", order: 17 },
  { id: "m-yuvraj", name: "Yuvraj Mathe", role: "Event Management Team Member", skills: ["Coordination", "Events Management", "Operations"], email: "matheyuvraj@gmail.com", github: "https://github.com/mYuvraj4118", linkedin: "https://www.linkedin.com/in/yuvraj-mathe", awsService: "Amazon Route 53", status: "running", order: 18 },
  { id: "m-nidhi", name: "Nidhi Patil", role: "Event Management Team Member", skills: ["Logistics", "Event Management", "Communication"], email: "nidhispatilkv@gmail.com", github: "", linkedin: "https://www.linkedin.com/in/nidhi-patil-0778673bb", awsService: "Amazon ECS", status: "running", order: 19 },
  { id: "m-fareeha", name: "Fareeha Naaz Abdul Khalique Modi", role: "Event Team Member", skills: ["Teamwork", "Event Planning", "Support"], email: "fareehanaaz15@gmail.com", github: "https://github.com/Fareeha06-sudo", linkedin: "https://www.linkedin.com/in/fareeha-modi-645654397", awsService: "AWS Amplify", status: "running", order: 20 },
  { id: "m-sankalp", name: "Sankalp Shinde", role: "Event Team Member", skills: ["Planning", "Event Logistics", "Onsite Coordination"], email: "sankalpshinde1005@gmail.com", github: "https://github.com/Sankalp2403", linkedin: "https://www.linkedin.com/in/sankalp-shinde-581004395?utm_source=share_via&utm_content=profile&utm_medium=member_android", awsService: "AWS Secrets Manager", status: "running", order: 21 },
  { id: "m-neel", name: "NEEL INGALE", role: "Onsite Team Member", skills: ["Execution", "Operations", "Coordination"], email: "neelringale@gmail.com", github: "https://github.com/neelringale", linkedin: "https://www.linkedin.com/in/neelringale", awsService: "Amazon EventBridge", status: "running", order: 22 },
  { id: "m-pawan", name: "Pawan Hatkar", role: "Onsite Team Member", skills: ["Support", "Execution", "Logistics"], email: "pavanhatkar8794@gmail.com", github: "https://github.com/pavanhatkar505-coder", linkedin: "https://www.linkedin.com/in/pavan-hatkar-2642633b4?utm_source=share_via&utm_content=profile&utm_medium=member_android", awsService: "Amazon Aurora", status: "running", order: 23 },
  { id: "m-ishwari", name: "Ishwari Nerkar", role: "Design Team Member", skills: ["Graphics", "Creative assets", "Social Media Templates"], email: "ishwarinerkar1010@gmail.com", github: "https://github.com/ishwarinerkar10", linkedin: "https://www.linkedin.com/in/ishwari-n-373015348", awsService: "AWS CodePipeline", status: "running", order: 24 },
  { id: "m-kartik", name: "Kartik Narkhede", role: "Design Team Member", skills: ["UI Elements", "Figma", "Branding"], email: "kartiknarkhede2007@gmail.com", github: "https://github.com/kartik2118-cloud", linkedin: "https://www.linkedin.com/in/kartik-narkhede-21kst18/", awsService: "Amazon CloudWatch", status: "running", order: 25 },
  { id: "m-shubham", name: "Shubham Ramesh Aute", role: "Design Team Member", skills: ["Graphics Layout", "Editing", "Visual Assets"], email: "shubhamaute101@gmail.com", github: "https://github.com/shubhamaute101", linkedin: "https://www.linkedin.com/in/shubham-aute-5b97b4385?utm_source=share_via&utm_content=profile&utm_medium=member_android", awsService: "Amazon VPC", status: "running", order: 26 },
  { id: "m-mayur", name: "Mayur Patle", role: "Design Team Member", skills: ["Visual Design", "Branding Asset Creation", "Layouts"], email: "patlemayur286@gmail.com", github: "https://github.com/git-mayurpatle", linkedin: "https://www.linkedin.com/in/mayurnpatle?utm_source=share_via&utm_content=profile&utm_medium=member_android", awsService: "Amazon Redshift", status: "running", order: 27 },
]

// ── Events ────────────────────────────────────────────────────────────────────

/** The group's first event — shown only if both Meetup and the events API are unreachable. */
export const FALLBACK_EVENTS = [
  {
    id: "fallback-intro-2026",
    title: "AWS Student Builder Group Intro Event",
    date: "April 8, 2026",
    dateTime: "2026-04-08T10:00:00+05:30",
    location: "In-person at NMIET, Pune",
    attendees: 236,
    description:
      "Covers AWS fundamentals, career paths, upcoming workshops & hands-on projects. Open to all!",
    eventUrl: CLUB.meetupUrl,
    isPast: true,
    imageUrls: [] as string[],
  },
]

// ── Resources ─────────────────────────────────────────────────────────────────

export type ResourceType = "Course" | "Video" | "Document" | "Tool"

export interface LearningResource {
  id: string
  name: string
  category: string
  type: ResourceType
  url: string
  featured: boolean
  order: number
}

export const FALLBACK_RESOURCES: LearningResource[] = [
  { id: "fb-1", name: "AWS Cloud Practitioner Essentials", category: "Getting Started", type: "Course", url: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/", featured: true, order: 1 },
  { id: "fb-2", name: "AWS Free Tier Overview", category: "Getting Started", type: "Document", url: "https://aws.amazon.com/free/", featured: false, order: 2 },
  { id: "fb-3", name: "AWS Skill Builder", category: "Getting Started", type: "Course", url: "https://skillbuilder.aws/", featured: true, order: 3 },
  { id: "fb-4", name: "AWS re:Post Community", category: "Getting Started", type: "Document", url: "https://repost.aws/", featured: false, order: 4 },
  { id: "fb-5", name: "Cloud Practitioner Exam Guide", category: "Certifications", type: "Document", url: "https://d1.awsstatic.com/training-and-certification/docs-cloud-practitioner/AWS-Certified-Cloud-Practitioner_Exam-Guide.pdf", featured: true, order: 5 },
  { id: "fb-6", name: "AWS Training & Certification", category: "Certifications", type: "Course", url: "https://aws.amazon.com/training/", featured: false, order: 6 },
  { id: "fb-7", name: "Solutions Architect – Associate", category: "Certifications", type: "Document", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", featured: true, order: 7 },
  { id: "fb-8", name: "AWS Workshops (workshops.aws)", category: "Hands-on Labs", type: "Tool", url: "https://workshops.aws/", featured: true, order: 8 },
  { id: "fb-9", name: "AWS Samples on GitHub", category: "Hands-on Labs", type: "Tool", url: "https://github.com/aws-samples", featured: false, order: 9 },
  { id: "fb-10", name: "AWS CDK Workshop", category: "Hands-on Labs", type: "Tool", url: "https://cdkworkshop.com/", featured: false, order: 10 },
  { id: "fb-11", name: "AWS Jam (Challenge Labs)", category: "Hands-on Labs", type: "Tool", url: "https://jam.awsevents.com/", featured: false, order: 11 },
  { id: "fb-12", name: "AWS Documentation Hub", category: "Official Docs", type: "Document", url: "https://docs.aws.amazon.com/", featured: false, order: 12 },
  { id: "fb-13", name: "AWS Architecture Center", category: "Official Docs", type: "Document", url: "https://aws.amazon.com/architecture/", featured: true, order: 13 },
  { id: "fb-14", name: "Well-Architected Framework", category: "Official Docs", type: "Document", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html", featured: false, order: 14 },
  { id: "fb-15", name: "AWS Official YouTube Channel", category: "Video Learning", type: "Video", url: "https://www.youtube.com/@amazonwebservices", featured: true, order: 15 },
  { id: "fb-16", name: "freeCodeCamp AWS Full Course", category: "Video Learning", type: "Video", url: "https://www.youtube.com/watch?v=NhDYbskXRgc", featured: false, order: 16 },
  { id: "fb-17", name: "AWS re:Invent Session Playlist", category: "Video Learning", type: "Video", url: "https://www.youtube.com/c/amazonwebservices/playlists", featured: false, order: 17 },
]

// ── Social ────────────────────────────────────────────────────────────────────

export interface SocialLink {
  id: string
  name: string
  url: string
  followers?: string
  platform: string
  color: string
}

/** Only links we know are real — used when the social-links API is unreachable. */
export const FALLBACK_SOCIAL_LINKS: SocialLink[] = [
  { id: "fb-youtube", name: "YouTube", platform: "YouTube", url: CLUB.youtubeUrl, color: "#FF0000" },
  { id: "fb-discord", name: "Discord", platform: "Discord", url: CLUB.discordUrl, color: "#5865F2" },
]

// ── Terminal ──────────────────────────────────────────────────────────────────

export const AWS_FACTS = [
  "AWS has over 200 fully featured services from data centers globally.",
  "The first AWS service was S3, launched in March 2006.",
  "AWS operates in 33 geographic regions with 105 Availability Zones.",
  "Lambda was the first mainstream FaaS (serverless compute) service, launched in 2014.",
  "EC2 stands for Elastic Compute Cloud — it launched in August 2006.",
  "AWS accounts for roughly 31% of the global cloud market share.",
  "Amazon S3 stores over 100 trillion objects worldwide.",
  "AWS CloudFront has over 600 Points of Presence worldwide.",
  "Amazon DynamoDB can handle over 10 trillion requests per day.",
  "Amazon EKS, AWS's managed Kubernetes service, became generally available in June 2018.",
  "Amazon Route 53 performs over 100 billion DNS queries daily.",
  "AWS re:Invent 2023 had over 52,000 in-person attendees in Las Vegas.",
]
