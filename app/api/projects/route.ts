// app/api/projects/route.ts
import { NextResponse } from "next/server"
import { scanTable, putItem, TABLES } from "@/lib/dynamodb"
import { validateAdminAuth } from "@/lib/auth"

export async function GET() {
  try {
    const projects = await scanTable(TABLES.PROJECTS)
    projects.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
    )
    return NextResponse.json({ projects })
  } catch {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const admin = await validateAdminAuth(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { title, description, stack, author, status, githubUrl, liveUrl, imageUrl } = await request.json()
    if (!title || !description) return NextResponse.json({ error: "title and description required" }, { status: 400 })

    const project = await putItem(TABLES.PROJECTS, {
      title, description,
      stack: stack || [],
      author: author || "",
      status: status || "Development",
      githubUrl: githubUrl || "",
      liveUrl: liveUrl || "",
      imageUrl: imageUrl || "",
    })
    return NextResponse.json({ project }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
