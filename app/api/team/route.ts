// app/api/team/route.ts
// Team members — public list, admin-managed

import { byOrder, collectionRoutes } from "@/lib/crud"
import { TABLES } from "@/lib/dynamodb"
import { teamMemberSchema } from "@/lib/validation"

export const { GET, POST } = collectionRoutes({
  table: TABLES.TEAM,
  schema: teamMemberSchema,
  listKey: "members",
  itemKey: "member",
  sort: byOrder,
})
