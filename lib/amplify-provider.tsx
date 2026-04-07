"use client"
// lib/amplify-provider.tsx
// Wraps the app with Amplify initialization — must be a client component

import { Amplify } from "aws-amplify"
import { amplifyConfig } from "./amplify-config"
import { useEffect } from "react"

let configured = false

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!configured) {
      Amplify.configure(amplifyConfig, { ssr: true })
      configured = true
    }
  }, [])

  return <>{children}</>
}
