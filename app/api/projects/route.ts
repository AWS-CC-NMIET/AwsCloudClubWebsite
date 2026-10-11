// app/api/projects/route.ts
// Projects — public list, admin-managed

import { byNewest, collectionRoutes } from "@/lib/crud"
import { TABLES } from "@/lib/dynamodb"
import { projectSchema } from "@/lib/validation"

export const { GET, POST } = collectionRoutes({
  table: TABLES.PROJECTS,
  schema: projectSchema,
  listKey: "projects",
  itemKey: "project",
  sort: byNewest("createdAt"),
})
