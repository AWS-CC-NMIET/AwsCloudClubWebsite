// app/api/achievements/[id]/route.ts

import { itemRoutes } from "@/lib/crud"
import { TABLES } from "@/lib/dynamodb"
import { achievementSchema } from "@/lib/validation"

export const { GET, PUT, DELETE } = itemRoutes({
  table: TABLES.ACHIEVEMENTS,
  schema: achievementSchema,
  listKey: "achievements",
  itemKey: "achievement",
})
