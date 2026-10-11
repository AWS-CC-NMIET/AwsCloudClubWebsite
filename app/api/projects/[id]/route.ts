// app/api/projects/[id]/route.ts

import { itemRoutes } from "@/lib/crud"
import { TABLES } from "@/lib/dynamodb"
import { projectSchema } from "@/lib/validation"

export const { GET, PUT, DELETE } = itemRoutes({
  table: TABLES.PROJECTS,
  schema: projectSchema,
  listKey: "projects",
  itemKey: "project",
})
