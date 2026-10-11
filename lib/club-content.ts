// lib/club-content.ts
// Real AWS Student Builder Group NMIET content — the single source of truth for
// everything static on the site (migrated verbatim from commit 4c899fc).

import { TEAM_PHOTOS } from "./team-photos"

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
  instagramUrl: "https://www.instagram.com/aws.sbg_nmiet/",
  linkedinUrl: "https://www.linkedin.com/company/aws-student-builder-group-nmiet/",
  region: "ap-south-1 (Mumbai)",
  /** Last verified Meetup member count (1,252 on 2026-10-11) — shown only until the live count loads. */
  fallbackMemberCount: 1250,
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

/** `{members}` and `{firstEventRsvps}` are filled in from live Meetup data. */
export const HIGHLIGHTS = [
  "Official AWS Student Builder Group — est. February 2026",
  "{members} Members on Meetup & Growing",
  "Part of AWS Student Builder Groups Global Network",
  "{firstEventRsvps} RSVPs for Our Very First Event",
]

/** RSVPs for the introductory event on 8 April 2026, per Meetup. */
export const FIRST_EVENT_RSVPS = 433

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
// Roster: roles and teams from the jacket list, contact details from the
// "Contact Information" form (Oct 2026). Photos are processed into
// /public/team by scripts/team-photo.mjs (see lib/team-photos.ts).

/** The teams ("constructors") of the club, in display order. */
export type TeamGroup = "Captain" | "Tech" | "Design" | "Media" | "Events" | "Onsite" | "Members"

export const TEAM_GROUPS: TeamGroup[] = ["Captain", "Tech", "Design", "Media", "Events", "Onsite", "Members"]

/** Livery for each team: name, colour and a darker shade for gradients. */
export const TEAM_LIVERY: Record<TeamGroup, { name: string; color: string; deep: string }> = {
  Captain: { name: "Core", color: "#F5B700", deep: "#8A5A00" },
  Tech: { name: "Tech", color: "#FF9900", deep: "#9A3D00" },
  Design: { name: "Design", color: "#8B5CF6", deep: "#3B1C8C" },
  Media: { name: "Media", color: "#EC4899", deep: "#7A1048" },
  Events: { name: "Events", color: "#14B8A6", deep: "#05514A" },
  Onsite: { name: "Onsite", color: "#3B82F6", deep: "#173A8A" },
  Members: { name: "Members", color: "#94A3B8", deep: "#334155" },
}

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
  /** "roster-seed" on members copied in by the roster import */
  source?: string
}

export function teamGroupOf(role: string): TeamGroup {
  if (/captain|sbg leader/i.test(role)) return "Captain"
  if (/tech/i.test(role)) return "Tech"
  if (/design/i.test(role)) return "Design"
  if (/media|social/i.test(role)) return "Media"
  if (/event/i.test(role)) return "Events"
  if (/onsite|on-site/i.test(role)) return "Onsite"
  return "Members"
}

export function isLeadRole(role: string) {
  return /\b(captain|lead|head|leader)\b/i.test(role)
}

const li = (handle: string) => `https://www.linkedin.com/in/${handle}`
const gh = (handle: string) => `https://github.com/${handle}`

const ROSTER: Omit<TeamMember, "status" | "photoUrl">[] = [
  // Captain
  { id: "m-neha", order: 1, name: "Neha Sharma", role: "SBG Captain", skills: ["AWS Cloud Computing", "Python", "Machine Learning", "Generative AI", "Docker", "Kubernetes", "MLOps"], email: "neha48330707@gmail.com", github: gh("NehaSama4833"), linkedin: li("neha-sharma-b08737316"), awsService: "AWS Cloud" },

  // Team leads
  { id: "m-sarthakg", order: 2, name: "Sarthak Suhas Godse", role: "Tech Team Lead", skills: ["AWS", "DevOps", "Infrastructure"], email: "sarthakgodse03@gmail.com", github: gh("Sarthak030506"), linkedin: li("sarthak-godse-7484b4290"), awsService: "Amazon EC2" },
  { id: "m-kirti", order: 3, name: "Kirti Anil Tambe", role: "Design Team Lead", skills: ["UI/UX", "Creative Direction", "Figma"], email: "kirti.tambe25@gmail.com", github: gh("kirtitambe07"), linkedin: li("kirti-tambe-2481a832a"), awsService: "AWS Step Functions" },
  { id: "m-rohan", order: 4, name: "Rohan Borude", role: "Media Team Lead", skills: ["Marketing", "Social Media", "Content"], email: "rohanbborude09@gmail.com", github: gh("CodexRohan-09"), linkedin: li("rohan-borude-796625380"), awsService: "Amazon EKS" },
  { id: "m-arya", order: 5, name: "Arya Chougule", role: "Event Team Lead", skills: [], email: "aryachougule1997@gmail.com", github: gh("aryachougule1997-sys"), linkedin: li("arya-chougule-79889632a"), awsService: "Amazon API Gateway" },
  { id: "m-sanskar", order: 6, name: "Sanskar Ubale", role: "Onsite Team Lead", skills: ["Logistics", "Operations", "Events"], email: "sanskarubale1@gmail.com", github: gh("2823sanskar"), linkedin: li("sanskar-ubale"), awsService: "Amazon SQS" },

  // Tech
  { id: "m-prathamesh", order: 7, name: "Prathamesh Patil", role: "Tech Team Member", skills: ["System Design", "Backend", "Cloud Deployments"], email: "prathameshpatil.cse@gmail.com", github: gh("prathamesh-lang"), linkedin: li("prathamesh-patil-794441385"), awsService: "AWS IAM" },
  { id: "m-pranav", order: 8, name: "Pranav Suryawanshi", role: "Tech Team Member", skills: ["Frontend", "Git", "React"], email: "pranavms09@gmail.com", github: gh("Pranavms09"), linkedin: li("pranavms09"), awsService: "Amazon CloudFront" },
  { id: "m-jay", order: 9, name: "Jay Ashok Magar", role: "Tech Team Member", skills: ["HTML/CSS", "JavaScript", "AWS Services"], email: "jaymagar310@gmail.com", github: gh("DevJay067"), linkedin: li("jay-magar-5ba92b369"), awsService: "AWS CloudFormation" },
  { id: "m-pawan", order: 10, name: "Pawan Hatkar", role: "Tech Team Member", skills: [], email: "pavanhatkar8794@gmail.com", github: gh("pavanhatkar505-coder"), linkedin: li("pavan-hatkar-2642633b4"), awsService: "Amazon Aurora" },
  { id: "m-aayush", order: 11, name: "Aayush Pawar", role: "Tech Team Member", skills: ["Cloud Fundamentals", "Programming", "AWS"], email: "aayush.pawar54321@gmail.com", github: "", linkedin: li("aayush-pawar-070387259"), awsService: "AWS CloudTrail" },
  { id: "m-tanmay", order: 12, name: "Tanmay Wadodkar", role: "Tech Team Member", skills: [], email: "tanmaywadodkar40@gmail.com", github: gh("tanmaywadodkar"), linkedin: li("tanmay-wadodkar-237b03385"), awsService: "AWS Fargate" },
  { id: "m-prakhar", order: 13, name: "Prakhar Raj", role: "Tech Team Member", skills: ["Web Dev", "API Integration", "NodeJS"], email: "rajprakhar2505@gmail.com", github: gh("rajprakhar07"), linkedin: li("prakhar-raj25"), awsService: "Amazon SNS" },
  { id: "m-sakshi", order: 14, name: "Sakshi Vinod Gurme", role: "Tech Team Member", skills: [], email: "gurmesakshi06@gmail.com", github: gh("SakshiGurme"), linkedin: li("sakshi-gurme"), awsService: "Amazon Bedrock" },
  { id: "m-saee", order: 15, name: "Saee Kumbhar", role: "Tech Team Member", skills: ["Cloud Engineering", "React", "AWS Services"], email: "saee.kumbhar@nmiet.edu.in", github: gh("saeeekumbhar"), linkedin: li("saeeekumbhar"), awsService: "Amazon RDS" },
  { id: "m-bhavjot", order: 16, name: "Bhavjot Singh Rooprai", role: "Tech Team Member", skills: [], email: "bhavsingh2911@gmail.com", github: gh("bhavsingh-gpu"), linkedin: li("bhavjot-singh-rooprai-a9b861385"), awsService: "Amazon Kinesis" },
  { id: "m-sarthakk", order: 17, name: "Sarthak Sanjay Kandhare", role: "Tech Team Member", skills: ["AWS Cloud", "Development", "Git"], email: "sarthakkandhare5@gmail.com", github: gh("SarthakKandhare03"), linkedin: li("sarthak-kandhare-898340312"), awsService: "Amazon SageMaker" },
  { id: "m-atharv", order: 18, name: "Atharv Rajendra Chaskar", role: "Tech Team Member", skills: [], email: "atharvchaskar0001@gmail.com", github: gh("Atharvchaskar008"), linkedin: "", awsService: "AWS Glue" },
  { id: "m-aarya", order: 19, name: "Aarya Mahesh Manolkar", role: "Tech Team Member", skills: [], email: "aaryamanolkar10@gmail.com", github: gh("aaryamanolkar10"), linkedin: li("aaryamanolkar"), awsService: "Amazon Athena" },
  { id: "m-lobhas", order: 20, name: "Lobhas Amar Tidke", role: "Tech Team Member", skills: [], email: "lobhastidke9a64@gmail.com", github: gh("lobhastidke"), linkedin: li("lobhas-tidke"), awsService: "AWS WAF" },

  // Design
  { id: "m-shubham", order: 21, name: "Shubham Ramesh Aute", role: "Design Team Member", skills: ["Graphics Layout", "Editing", "Visual Assets"], email: "shubhamaute101@gmail.com", github: gh("shubhamaute101"), linkedin: li("shubham-aute-5b97b4385"), awsService: "Amazon VPC" },
  { id: "m-ishwari", order: 22, name: "Ishwari Nerkar", role: "Design Team Member", skills: ["Graphics", "Creative assets", "Social Media Templates"], email: "ishwarinerkar1010@gmail.com", github: gh("ishwarinerkar10"), linkedin: li("ishwari-n-373015348"), awsService: "AWS CodePipeline" },
  { id: "m-gayatri", order: 23, name: "Gayatri Trimbak Jadhav", role: "Design Team Member", skills: ["Visual Design", "UI Design", "Branding"], email: "jadhavgayatri401@gmail.com", github: gh("jadhavgayatri25"), linkedin: li("gayatri-jadhav-805b92331"), awsService: "Amazon DynamoDB" },
  { id: "m-harshad", order: 24, name: "Harshad Pandurang Kedari", role: "Design Team Member", skills: ["Creative Design", "Graphics", "Figma"], email: "harshadkedari211@gmail.com", github: gh("Harsh-901"), linkedin: li("harshad-kedari"), awsService: "Amazon S3" },
  { id: "m-kartik", order: 25, name: "Kartik Narkhede", role: "Design Team Member", skills: ["UI Elements", "Figma", "Branding"], email: "kartiknarkhede2007@gmail.com", github: gh("kartik2118-cloud"), linkedin: li("kartik-narkhede-21kst18"), awsService: "Amazon CloudWatch" },
  { id: "m-mayur", order: 26, name: "Mayur Patle", role: "Design Team Member", skills: ["Visual Design", "Branding Asset Creation", "Layouts"], email: "patlemayur286@gmail.com", github: gh("git-mayurpatle"), linkedin: li("mayurnpatle"), awsService: "Amazon Redshift" },
  { id: "m-snehali", order: 27, name: "Snehali Sudhir Savant", role: "Design Team Member", skills: ["Graphic Design", "Illustration", "UI"], email: "snehalisavant25@gmail.com", github: gh("snehalisavant25"), linkedin: li("snehali-savant-4160b232a"), awsService: "AWS Lambda" },

  // Media
  { id: "m-faisal", order: 28, name: "Faisal Momin", role: "Media Team Member", skills: ["Photography", "Content Marketing", "Design"], email: "faisalmomin657@gmail.com", github: gh("faisalmomin11-jpg"), linkedin: li("faisal-momin-080427385"), awsService: "AWS KMS" },
  { id: "m-rutvik", order: 29, name: "Rutvik Kale", role: "Media Team Member", skills: ["Content Creation", "Public Relations", "Graphics"], email: "rutvikkale2006@gmail.com", github: gh("Ritronn"), linkedin: li("rutvik-kale-749775286"), awsService: "AWS Cognito" },

  // Events
  { id: "m-yuvraj", order: 30, name: "Yuvraj Mathe", role: "Event Team Member", skills: ["Coordination", "Events Management", "Operations"], email: "matheyuvraj@gmail.com", github: gh("mYuvraj4118"), linkedin: li("yuvraj-mathe"), awsService: "Amazon Route 53" },
  { id: "m-nidhi", order: 31, name: "Nidhi Patil", role: "Event Team Member", skills: ["Logistics", "Event Management", "Communication"], email: "nidhispatilkv@gmail.com", github: "", linkedin: li("nidhi-patil-0778673bb"), awsService: "Amazon ECS" },
  { id: "m-sankalp", order: 32, name: "Sankalp Shinde", role: "Event Team Member", skills: ["Planning", "Event Logistics", "Onsite Coordination"], email: "sankalpshinde1005@gmail.com", github: gh("Sankalp2403"), linkedin: li("sankalp-shinde-581004395"), awsService: "AWS Secrets Manager" },
  { id: "m-fareeha", order: 33, name: "Fareeha Naaz Abdul Khalique Modi", role: "Event Team Member", skills: ["Teamwork", "Event Planning", "Support"], email: "fareehanaaz15@gmail.com", github: gh("Fareeha06-sudo"), linkedin: li("fareeha-modi-645654397"), awsService: "AWS Amplify" },

  // Onsite
  { id: "m-neel", order: 34, name: "Neel Ingale", role: "Onsite Team Member", skills: ["Execution", "Operations", "Coordination"], email: "neelringale@gmail.com", github: gh("neelringale"), linkedin: li("neelringale"), awsService: "Amazon EventBridge" },
  { id: "m-abdullah", order: 35, name: "Abdullah Munawar Khan", role: "Onsite Team Member", skills: [], email: "abdullahk4503@gmail.com", github: gh("abdullahMunawarKhan"), linkedin: li("abdullah-munawar-khan-175a6b322"), awsService: "Amazon ElastiCache" },
  { id: "m-ayushi", order: 36, name: "Ayushi Holey", role: "Onsite Team Member", skills: [], email: "ayushiholey26@gmail.com", github: gh("ayushi-2603"), linkedin: li("ayushi-holey-721618385"), awsService: "AWS Backup" },
]

export const TEAM_MEMBERS: TeamMember[] = ROSTER.map(m => ({
  ...m,
  status: "running",
  photoUrl: TEAM_PHOTOS[m.id],
}))

// ── Events ────────────────────────────────────────────────────────────────────

export interface FallbackEvent {
  id: string
  title: string
  date: string
  dateTime: string
  location: string
  attendees: number
  eventUrl: string
  imageUrl: string | null
  isPast: boolean
}

/** Real events from Meetup (snapshot 2026-10-11) — shown only when Meetup is unreachable. */
export const FALLBACK_EVENTS: FallbackEvent[] = [
  {
    id: "316840541",
    title: "Cloud Security with AWS IAM",
    date: "13 October 2026",
    dateTime: "2026-10-13T10:30:00+05:30",
    location: "Nutan Maharashtra Institute of Engineering & Technology",
    attendees: 143,
    eventUrl: "https://www.meetup.com/aws-sbg-at-nutan-maharashtra-inst-of-engineering-and-tech/events/316840541/",
    imageUrl: null,
    isPast: false,
  },
  {
    id: "314129944",
    title: "AWS Cloud Club Introductory Event",
    date: "8 April 2026",
    dateTime: "2026-04-08T11:00:00+05:30",
    location: "Venue not listed",
    attendees: 433,
    eventUrl: "https://www.meetup.com/aws-sbg-at-nutan-maharashtra-inst-of-engineering-and-tech/events/314129944/",
    imageUrl: "https://secure.meetupstatic.com/photos/event/7/7/f/1/highres_533550705.jpeg",
    isPast: true,
  },
  {
    id: "314856498",
    title: "Pay As You Grow: How Cloud Makes Entrepreneurship Affordable",
    date: "24 May 2026",
    dateTime: "2026-05-24T11:00:00+05:30",
    location: "Online event",
    attendees: 183,
    eventUrl: "https://www.meetup.com/aws-sbg-at-nutan-maharashtra-inst-of-engineering-and-tech/events/314856498/",
    imageUrl: "https://secure.meetupstatic.com/photos/event/1/f/7/4/highres_534308052.jpeg",
    isPast: true,
  },
  {
    id: "315115200",
    title: "Cooking website with Kiro",
    date: "5 June 2026",
    dateTime: "2026-06-05T17:00:00+05:30",
    location: "Online event",
    attendees: 38,
    eventUrl: "https://www.meetup.com/aws-sbg-at-nutan-maharashtra-inst-of-engineering-and-tech/events/315115200/",
    imageUrl: null,
    isPast: true,
  },
  {
    id: "315975278",
    title: "Build Together Saturday",
    date: "8 August 2026",
    dateTime: "2026-08-08T11:00:00+05:30",
    location: "Online event",
    attendees: 62,
    eventUrl: "https://www.meetup.com/aws-sbg-at-nutan-maharashtra-inst-of-engineering-and-tech/events/315975278/",
    imageUrl: "https://secure.meetupstatic.com/photos/event/3/9/6/0/highres_535514688.jpeg",
    isPast: true,
  },
  {
    id: "315975198",
    title: "Coffee & Cloud",
    date: "9 August 2026",
    dateTime: "2026-08-09T11:00:00+05:30",
    location: "Online event",
    attendees: 58,
    eventUrl: "https://www.meetup.com/aws-sbg-at-nutan-maharashtra-inst-of-engineering-and-tech/events/315975198/",
    imageUrl: "https://secure.meetupstatic.com/photos/event/3/8/8/b/highres_535514475.jpeg",
    isPast: true,
  },
  {
    id: "316182060",
    title: "From Git to Production: Build, Containerize & Deploy on AWS",
    date: "31 August 2026",
    dateTime: "2026-08-31T20:00:00+05:30",
    location: "Online event",
    attendees: 256,
    eventUrl: "https://www.meetup.com/aws-sbg-at-nutan-maharashtra-inst-of-engineering-and-tech/events/316182060/",
    imageUrl: "https://secure.meetupstatic.com/photos/event/1/f/7/4/highres_534308052.jpeg",
    isPast: true,
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
  /** Display handle, e.g. "@aws.sbg_nmiet". */
  handle?: string
  platform: string
  color: string
}

/**
 * Our official channels (verified). Always shown, in this order; a database
 * entry for the same platform is replaced by these URLs (old entries point at
 * the pre-rename AWS Cloud Club accounts).
 */
export const FALLBACK_SOCIAL_LINKS: SocialLink[] = [
  { id: "fb-instagram", name: "Instagram", platform: "instagram", url: CLUB.instagramUrl, handle: "@aws.sbg_nmiet", color: "#E1306C" },
  { id: "fb-linkedin", name: "LinkedIn", platform: "linkedin", url: CLUB.linkedinUrl, handle: "AWS Student Builder Group NMIET", color: "#0A66C2" },
  { id: "fb-youtube", name: "YouTube", platform: "youtube", url: CLUB.youtubeUrl, handle: "@AWSStudentBuildersGroupNMIET", color: "#FF0000" },
]

/** Links verified as dead (expired invites etc.) — never shown, even if still stored in the database. */
export const DEAD_LINKS = ["discord.gg/BydTcjm8g"]

// ── Terminal ──────────────────────────────────────────────────────────────────

/** Each fact checked against AWS's own pages (Oct 2026). Dated numbers say "as of". */
export const AWS_FACTS = [
  "AWS offers over 200 fully featured services from data centers around the world.",
  "Amazon S3 launched on 14 March 2006 — one of the very first AWS services.",
  "As of 2026, AWS runs 39 Regions with 123 Availability Zones, with more announced.",
  "AWS Lambda launched in November 2014 and made serverless computing mainstream.",
  "Amazon EC2 (Elastic Compute Cloud) launched in August 2006.",
  "Amazon S3 is designed for 99.999999999% (11 nines) of data durability.",
  "Amazon S3 passed 100 trillion stored objects back in 2021.",
  "Amazon CloudFront serves content from 750+ points of presence worldwide.",
  "Amazon DynamoDB handles more than 10 trillion requests per day.",
  "Amazon EKS, AWS's managed Kubernetes service, became generally available in June 2018.",
  "A single AWS Lambda invocation can run for up to 15 minutes.",
  "DynamoDB delivers single-digit millisecond performance at any scale.",
]
