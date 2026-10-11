// lib/use-load.ts
// Fetch on mount and on demand. State only changes when a request settles —
// never synchronously inside the effect — and `loading` is derived from
// whether the latest request has come back.

"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface Settled<T> {
  request: number
  data?: T
  error?: string
}

/** `fetcher` must be stable (module-level or memoised); a new identity refetches. */
export function useLoad<T>(fetcher: () => Promise<T>) {
  const [request, setRequest] = useState(0)
  const [settled, setSettled] = useState<Settled<T> | null>(null)
  const lastRequest = useRef(0)
  const waiters = useRef(new Map<number, () => void>())

  useEffect(() => {
    let active = true
    fetcher()
      .then(
        data => {
          if (active) setSettled({ request, data })
        },
        (err: unknown) => {
          const error = err instanceof Error && err.message ? err.message : "Request failed"
          if (active) setSettled(prev => ({ request, data: prev?.data, error }))
        }
      )
      .finally(() => {
        waiters.current.get(request)?.()
        waiters.current.delete(request)
      })
    return () => {
      active = false
    }
  }, [fetcher, request])

  /** Fetch again; resolves once the fresh result (or error) is in. */
  const reload = useCallback(
    () =>
      new Promise<void>(resolve => {
        const next = ++lastRequest.current
        waiters.current.set(next, resolve)
        setRequest(next)
      }),
    []
  )

  /** Edit the loaded data locally (optimistic updates). */
  const mutate = useCallback((update: (data: T | undefined) => T) => {
    setSettled(prev => (prev ? { ...prev, data: update(prev.data) } : prev))
  }, [])

  const current = settled?.request === request
  return { data: settled?.data, error: current ? settled?.error : undefined, loading: !current, reload, mutate }
}
