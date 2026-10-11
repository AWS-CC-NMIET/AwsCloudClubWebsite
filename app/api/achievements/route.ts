// app/api/achievements/route.ts
// Achievements — public list, admin-managed

import { byOrder, collectionRoutes } from "@/lib/crud"
import { TABLES } from "@/lib/dynamodb"
import { achievementSchema } from "@/lib/validation"

export const { GET, POST } = collectionRoutes({
  table: TABLES.ACHIEVEMENTS,
  schema: achievementSchema,
  listKey: "achievements",
  itemKey: "achievement",
  sort: byOrder,
})
