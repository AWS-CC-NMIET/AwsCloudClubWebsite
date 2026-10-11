// app/api/events/[id]/route.ts

import { itemRoutes } from "@/lib/crud"
import { TABLES } from "@/lib/dynamodb"
import { eventSchema } from "@/lib/validation"

export const { GET, PUT, DELETE } = itemRoutes({
  table: TABLES.EVENTS,
  schema: eventSchema,
  listKey: "events",
  itemKey: "event",
})
