// lib/validation.ts
// Request schemas for every write endpoint. Unknown fields are stripped, so a
// request can never overwrite ids, timestamps or invent new attributes.

import { z } from "zod"

const text = (max: number) => z.string().trim().max(max)
const requiredText = (max: number) => z.string().trim().min(1, "is required").max(max)

/** "" or an http(s) URL, or one of our own /api/image proxy URLs. */
const link = z
  .string()
  .trim()
  .max(2048)
  .refine(v => v === "" || /^https?:\/\/[^\s]+$/i.test(v) || v.startsWith("/api/image?key="), "must be an http(s) link")

/** Accepts "a, b, c" or ["a", "b"]. */
const stringList = (maxItems: number, maxLength = 80) =>
  z.preprocess(
    v => (typeof v === "string" ? v.split(",") : v),
    z.array(z.string().trim().max(maxLength)).max(maxItems).transform(list => list.filter(Boolean))
  )

const intField = z.coerce.number().int().min(0).max(100_000)
const boolField = z.preprocess(v => (v === "true" ? true : v === "false" ? false : v), z.boolean())
const hexColor = z.string().trim().regex(/^#?[0-9a-f]{3,8}$/i, "must be a hex colour").or(z.literal(""))
const isoDate = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD")

export const eventSchema = z.object({
  title: requiredText(200),
  date: isoDate,
  location: requiredText(300),
  description: text(5000).default(""),
  attendees: intField.default(0),
  isPast: boolField.default(false),
  tags: stringList(20).default([]),
  imageUrls: z.array(link).max(60).default([]),
})

export const teamMemberSchema = z.object({
  name: requiredText(120),
  role: requiredText(120),
  skills: stringList(20).default([]),
  bio: text(1000).default(""),
  email: z.string().trim().email("must be an email").max(254).or(z.literal("")).default(""),
  linkedin: link.default(""),
  github: link.default(""),
  photoUrl: link.default(""),
  awsService: text(60).default(""),
  status: z.enum(["running", "stopped"]).default("running"),
  order: intField.default(99),
})

export const projectSchema = z.object({
  title: requiredText(200),
  description: requiredText(5000),
  author: text(200).default(""),
  status: z.enum(["Production", "Development", "Beta"]).default("Development"),
  stack: stringList(30).default([]),
  githubUrl: link.default(""),
  liveUrl: link.default(""),
  imageUrl: link.default(""),
})

export const achievementSchema = z.object({
  title: requiredText(200),
  date: text(40).default(""),
  type: text(40).default("Milestone"),
  description: text(2000).default(""),
  iconName: z.enum(["Trophy", "Award", "Star", "Medal", "Target", "Zap"]).default("Trophy"),
  color: hexColor.default("#FF9900"),
  order: intField.default(0),
})

export const resourceSchema = z.object({
  name: requiredText(200),
  category: requiredText(80),
  type: z.enum(["Course", "Video", "Document", "Tool"]),
  url: link.refine(v => v !== "", "is required"),
  featured: boolField.default(false),
  order: intField.default(0),
})

export const socialLinkSchema = z.object({
  name: requiredText(60),
  platform: requiredText(40),
  url: link.refine(v => v !== "", "is required"),
  followers: text(40).default(""),
  color: hexColor.default(""),
})

export const contactSchema = z.object({
  name: requiredText(100),
  email: z.string().trim().toLowerCase().email("must be a valid email").max(254),
  subject: requiredText(200),
  message: requiredText(2000),
  /** Honeypot — real visitors never see or fill this field. */
  website: z.string().optional(),
})

export const contactUpdateSchema = z.object({ isRead: boolField })

export const profileSchema = z.object({
  displayName: text(80),
  bio: text(500),
  avatarUrl: link,
  linkedinUrl: link,
  githubUrl: link,
  skills: stringList(20, 40),
})

export const uploadSchema = z.object({
  folder: z.enum(["events", "team", "projects", "general"]),
  fileType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
})

export const adminUserActionSchema = z.object({
  username: requiredText(128),
  action: z.enum(["promote", "demote"]),
})
