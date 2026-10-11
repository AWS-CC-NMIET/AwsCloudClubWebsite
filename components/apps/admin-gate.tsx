// components/apps/admin-gate.tsx
// Renders the Admin panel only after the server confirms the caller is in the
// Cognito "admins" group. Everyone else gets a macOS-style "Access denied".

"use client"

import React, { useEffect, useState } from "react"
import { ShieldAlert } from "lucide-react"
import { confirmAdmin, useSession } from "@/lib/session"
import { windowActions } from "@/lib/aws-store"
import { CLUB } from "@/lib/club-content"
import { AppShell, LoadingState, MacButton } from "./shared/mac-ui"

export function AdminGate({ children }: { children: React.ReactNode }) {
  const session = useSession()
  const [state, setState] = useState<"checking" | "allowed" | "denied">("checking")

  useEffect(() => {
    let active = true
    setState("checking")
    confirmAdmin().then(ok => active && setState(ok ? "allowed" : "denied"))
    return () => {
      active = false
    }
  }, [session.username, session.signedIn])

  if (state === "checking") {
    return (
      <AppShell>
        <LoadingState label="Verifying admin access…" />
      </AppShell>
    )
  }

  if (state === "denied") {
    return (
      <AppShell className="flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-red-500/10">
          <ShieldAlert className="size-7 text-red-500" />
        </div>
        <h2 className="text-lg font-bold">Admins only</h2>
        <p className="max-w-sm text-sm leading-relaxed text-(--os-text-dim)">
          {session.signedIn
            ? "Your account doesn't have admin access. If you're on the core team, ask an existing admin to add you in Admin → Users, then sign out and back in."
            : "Sign in with an admin account to manage the site."}
        </p>
        <div className="flex gap-2 pt-1">
          <MacButton onClick={() => windowActions.close("admin")}>Close</MacButton>
          <MacButton variant="primary" href={`mailto:${CLUB.email}?subject=Admin%20access%20request`}>
            Request access
          </MacButton>
        </div>
      </AppShell>
    )
  }

  return <>{children}</>
}
