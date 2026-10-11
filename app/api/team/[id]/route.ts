// app/api/team/[id]/route.ts

import { itemRoutes } from "@/lib/crud"
import { TABLES } from "@/lib/dynamodb"
import { teamMemberSchema } from "@/lib/validation"

export const { GET, PUT, DELETE } = itemRoutes({
  table: TABLES.TEAM,
  schema: teamMemberSchema,
  listKey: "members",
  itemKey: "member",
})
