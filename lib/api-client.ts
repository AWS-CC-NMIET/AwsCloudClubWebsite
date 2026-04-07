// lib/api-client.ts
// Client-side typed fetch helpers — auto-attaches Cognito auth token

import { getAccessToken } from "@/lib/auth-client"

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = getAccessToken()
  if (token) return { Authorization: `Bearer ${token}` }
  return {}
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const authHeader = await getAuthHeader()
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeader, ...(options.headers || {}) },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// ── Events ────────────────────────────────────────────────────
export const api = {
  events: {
    list: ()              => apiFetch<{ events: unknown[] }>("/api/events"),
    create: (data: unknown) => apiFetch<{ event: unknown }>("/api/events", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: unknown) => apiFetch<{ event: unknown }>(`/api/events/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string)  => apiFetch<{ success: boolean }>(`/api/events/${id}`, { method: "DELETE" }),
  },
  team: {
    list: ()              => apiFetch<{ members: unknown[] }>("/api/team"),
    create: (data: unknown) => apiFetch<{ member: unknown }>("/api/team", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: unknown) => apiFetch<{ member: unknown }>(`/api/team/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string)  => apiFetch<{ success: boolean }>(`/api/team/${id}`, { method: "DELETE" }),
  },
  projects: {
    list: ()              => apiFetch<{ projects: unknown[] }>("/api/projects"),
    create: (data: unknown) => apiFetch<{ project: unknown }>("/api/projects", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: unknown) => apiFetch<{ project: unknown }>(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string)  => apiFetch<{ success: boolean }>(`/api/projects/${id}`, { method: "DELETE" }),
  },
  achievements: {
    list: ()              => apiFetch<{ achievements: unknown[] }>("/api/achievements"),
    create: (data: unknown) => apiFetch<{ achievement: unknown }>("/api/achievements", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: unknown) => apiFetch<{ achievement: unknown }>(`/api/achievements/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string)  => apiFetch<{ success: boolean }>(`/api/achievements/${id}`, { method: "DELETE" }),
  },
  resources: {
    list: ()              => apiFetch<{ resources: unknown[] }>("/api/resources"),
    create: (data: unknown) => apiFetch<{ resource: unknown }>("/api/resources", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: unknown) => apiFetch<{ resource: unknown }>(`/api/resources/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string)  => apiFetch<{ success: boolean }>(`/api/resources/${id}`, { method: "DELETE" }),
  },
  social: {
    list: ()              => apiFetch<{ links: unknown[] }>("/api/social-links"),
    create: (data: unknown) => apiFetch<{ link: unknown }>("/api/social-links", { method: "POST", body: JSON.stringify(data) }),
    update: (data: unknown) => apiFetch<{ link: unknown }>("/api/social-links", { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string)  => apiFetch<{ success: boolean }>("/api/social-links", { method: "DELETE", body: JSON.stringify({ id }) }),
  },
  contact: {
    submit: (data: unknown) => apiFetch<{ success: boolean; id: string }>("/api/contact", { method: "POST", body: JSON.stringify(data) }),
    list: ()                => apiFetch<{ submissions: unknown[] }>("/api/contact"),
    markRead: (id: string, isRead: boolean) => apiFetch<{ submission: unknown }>(`/api/contact/${id}`, { method: "PUT", body: JSON.stringify({ isRead }) }),
    delete: (id: string)    => apiFetch<{ success: boolean }>(`/api/contact/${id}`, { method: "DELETE" }),
  },
  profile: {
    get: ()               => apiFetch<{ profile: unknown }>("/api/profile"),
    create: (data: unknown) => apiFetch<{ profile: unknown }>("/api/profile", { method: "POST", body: JSON.stringify(data) }),
    update: (data: unknown) => apiFetch<{ profile: unknown }>("/api/profile", { method: "PUT", body: JSON.stringify(data) }),
  },
  config: {
    get: ()               => apiFetch<{ config: Record<string, string> }>("/api/config"),
    set: (key: string, value: string, type?: string) => apiFetch<{ success: boolean }>("/api/config", { method: "PUT", body: JSON.stringify({ key, value, type }) }),
  },
  admin: {
    stats: ()             => apiFetch<{ stats: Record<string, number> }>("/api/admin/stats"),
    users: {
      list: ()            => apiFetch<{ users: unknown[] }>("/api/admin/users"),
      promote: (username: string) => apiFetch<{ success: boolean }>("/api/admin/users", { method: "PUT", body: JSON.stringify({ username, action: "promote" }) }),
      demote:  (username: string) => apiFetch<{ success: boolean }>("/api/admin/users", { method: "PUT", body: JSON.stringify({ username, action: "demote" }) }),
    },
  },
  upload: {
    getPresignedUrl: (folder: string, fileType: string) =>
      apiFetch<{ uploadUrl: string; fileUrl: string; key: string }>("/api/upload", {
        method: "POST",
        body: JSON.stringify({ folder, fileType }),
      }),
  },
}

// ── Upload file to S3 using presigned URL ─────────────────────
export async function uploadFileToS3(
  folder: "events" | "team" | "projects" | "general",
  file: File
): Promise<string> {
  const { uploadUrl, fileUrl } = await api.upload.getPresignedUrl(folder, file.type)
  await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } })
  return fileUrl
}
