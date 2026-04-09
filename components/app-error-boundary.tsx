"use client"

import React from "react"
import { motion } from "framer-motion"
import { RefreshCw, AlertTriangle } from "lucide-react"

interface Props { children: React.ReactNode }
interface State { hasError: boolean; error: Error | null }

/**
 * ErrorBoundary — wraps each app window's content.
 * If a single app crashes, only that window shows the error;
 * the rest of Cloud OS continues to function.
 */
export class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[CloudOS] App crashed:", error, info.componentStack)
  }

  handleRetry = () => this.setState({ hasError: false, error: null })

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-5 p-8">
          <motion.div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(232,85,128,0.10)",
              border: "1.5px solid rgba(232,85,128,0.25)",
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertTriangle className="h-8 w-8" style={{ color: "#E85580" }} />
          </motion.div>

          <div className="text-center">
            <h3 className="text-base font-bold mb-1" style={{ color: "#1E1060" }}>
              This app crashed
            </h3>
            <p className="text-sm mb-1" style={{ color: "#7B6FC0" }}>
              An unexpected error occurred in this window.
            </p>
            {this.state.error && (
              <p className="text-xs font-mono px-3 py-2 rounded-lg" style={{ color: "#9B8FC8", background: "rgba(107,79,232,0.06)" }}>
                {this.state.error.message}
              </p>
            )}
          </div>

          <motion.button
            onClick={this.handleRetry}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#6B4FE8,#8B6FFF)" }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </motion.button>
        </div>
      )
    }
    return this.props.children
  }
}
