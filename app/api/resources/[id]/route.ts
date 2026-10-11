// app/api/resources/[id]/route.ts

import { itemRoutes } from "@/lib/crud"
import { TABLES } from "@/lib/dynamodb"
import { resourceSchema } from "@/lib/validation"

export const { GET, PUT, DELETE } = itemRoutes({
  table: TABLES.RESOURCES,
  schema: resourceSchema,
  listKey: "resources",
  itemKey: "resource",
})
