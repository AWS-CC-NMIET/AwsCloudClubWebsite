// app/api/events/route.ts
// Events — public list, admin-managed

import { byNewest, collectionRoutes } from "@/lib/crud"
import { TABLES } from "@/lib/dynamodb"
import { eventSchema } from "@/lib/validation"

export const { GET, POST } = collectionRoutes({
  table: TABLES.EVENTS,
  schema: eventSchema,
  listKey: "events",
  itemKey: "event",
  sort: byNewest("date"),
})
