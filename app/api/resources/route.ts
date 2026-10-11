// app/api/resources/route.ts
// Learning resources — public list, admin-managed

import { byOrder, collectionRoutes } from "@/lib/crud"
import { TABLES } from "@/lib/dynamodb"
import { resourceSchema } from "@/lib/validation"

export const { GET, POST } = collectionRoutes({
  table: TABLES.RESOURCES,
  schema: resourceSchema,
  listKey: "resources",
  itemKey: "resource",
  sort: byOrder,
})
