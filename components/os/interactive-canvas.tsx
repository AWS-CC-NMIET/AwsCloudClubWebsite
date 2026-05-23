"use client"

import { useEffect, useRef, useState } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  baseColor: string
  alpha: number
  pulseSpeed: number
  pulsePhase: number
  isMainNode: boolean
}

interface Packet {
  from: Particle
  to: Particle
  progress: number
  speed: number
  color: string
}

interface Shockwave {
  x: number
  y: number
  radius: number
  maxRadius: number
  speed: number
  strength: number
  alpha: number
}

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  life: number
  maxLife: number
}

interface InteractiveCanvasProps {
  theme?: "light" | "dark"
  particleCountOverride?: number
}

export function InteractiveCanvas({ theme = "light", particleCountOverride }: InteractiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Track mouse coordinates and interaction status
  const mouseRef = useRef({ x: -1000, y: -1000, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []
    let packets: Packet[] = []
    let shockwaves: Shockwave[] = []
    let sparks: Spark[] = []

    // Adjust particle density based on screen size
    const getParticleCount = () => {
      if (particleCountOverride !== undefined) return particleCountOverride
      const width = window.innerWidth
      if (width < 640) return 30 // mobile
      if (width < 1024) return 60 // tablet
      return 90 // desktop
    }

    // Color palettes
    const darkPalette = [
      "rgba(255, 153, 0, 1)",   // AWS Orange
      "rgba(107, 79, 232, 1)",  // Purple
      "rgba(184, 164, 255, 1)", // Light purple
      "rgba(80, 200, 138, 1)",  // Mint Green
      "rgba(91, 168, 216, 1)",  // Cloud Blue
    ]

    const lightPalette = [
      "rgba(107, 79, 232, 1)",  // Purple
      "rgba(255, 153, 0, 1)",   // Orange
      "rgba(139, 111, 255, 1)", // Violet
      "rgba(60, 180, 120, 1)",  // Green
      "rgba(85, 160, 210, 1)",  // Blue
    ]

    const palette = theme === "dark" ? darkPalette : lightPalette

    // Initialize particles
    const initParticles = () => {
      const count = getParticleCount()
      particles = []
      packets = []
      shockwaves = []
      sparks = []

      const dpr = window.devicePixelRatio || 1
      const width = canvas.width / dpr
      const height = canvas.height / dpr

      for (let i = 0; i < count; i++) {
        const isMainNode = Math.random() < 0.25 // 25% are main/larger nodes
        const baseColor = palette[Math.floor(Math.random() * palette.length)]
        
        let vx = (Math.random() - 0.5) * (isMainNode ? 0.35 : 0.7)
        let vy = (Math.random() - 0.5) * (isMainNode ? 0.35 : 0.7)

        if (theme === "dark") {
          // Zero-G upward bias
          vy = -Math.random() * (isMainNode ? 0.35 : 0.6) - 0.1
        }
        
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx,
          vy,
          size: isMainNode ? Math.random() * 3.5 + 2.5 : Math.random() * 1.5 + 0.8,
          baseColor,
          alpha: isMainNode ? Math.random() * 0.4 + 0.5 : Math.random() * 0.3 + 0.3,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          pulsePhase: Math.random() * Math.PI * 2,
          isMainNode,
        })
      }
    }

    // Set dimensions with Device Pixel Ratio for sharp rendering
    const handleResize = () => {
      if (!canvas || !container) return
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      
      ctx.scale(dpr, dpr)
      initParticles()
    }

    // Initialize dimensions
    handleResize()
    window.addEventListener("resize", handleResize)

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
      mouseRef.current.active = true
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
      mouseRef.current.x = -1000
      mouseRef.current.y = -1000
    }

    const handleWindowClick = (e: MouseEvent) => {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Trigger shockwave
      shockwaves.push({
        x,
        y,
        radius: 0,
        maxRadius: 200 + Math.random() * 100,
        speed: 4.5,
        strength: 9,
        alpha: 1,
      })
    }

    // Touch support for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0 || !canvas) return
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.touches[0].clientX - rect.left
      mouseRef.current.y = e.touches[0].clientY - rect.top
      mouseRef.current.active = true
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0 || !canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.touches[0].clientX - rect.left
      const y = e.touches[0].clientY - rect.top
      mouseRef.current.x = x
      mouseRef.current.y = y
      mouseRef.current.active = true
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("click", handleWindowClick)
    window.addEventListener("touchmove", handleTouchMove, { passive: true })
    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchend", handleMouseLeave, { passive: true })

    // Animation loop
    const animate = () => {
      const width = canvas.width / (window.devicePixelRatio || 1)
      const height = canvas.height / (window.devicePixelRatio || 1)
      
      ctx.clearRect(0, 0, width, height)

      // 1. Draw connections
      const maxDist = 135
      ctx.lineWidth = 1
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i]
          const p2 = particles[j]

          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < maxDist) {
            const alphaFactor = 1 - dist / maxDist
            const connAlpha = theme === "dark" 
              ? alphaFactor * 0.15
              : alphaFactor * 0.08
            
            // Connection line color
            ctx.strokeStyle = theme === "dark"
              ? `rgba(155, 143, 255, ${connAlpha})`
              : `rgba(107, 79, 232, ${connAlpha})`
            
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()

            // Spawn data packet along connection between main nodes occasionally
            if (p1.isMainNode && p2.isMainNode && packets.length < 15 && Math.random() < 0.00035) {
              packets.push({
                from: p1,
                to: p2,
                progress: 0,
                speed: 0.008 + Math.random() * 0.015,
                color: p1.baseColor.replace("1)", "0.95)"),
              })
            }
          }
        }
      }

      // 2. Update and draw shockwaves
      for (let sIdx = shockwaves.length - 1; sIdx >= 0; sIdx--) {
        const s = shockwaves[sIdx]
        s.radius += s.speed
        s.alpha = Math.max(0, 1 - s.radius / s.maxRadius)

        if (s.alpha <= 0) {
          shockwaves.splice(sIdx, 1)
          continue
        }

        // Draw expanding shockwave ring
        ctx.strokeStyle = theme === "dark"
          ? `rgba(170, 150, 255, ${s.alpha * 0.25})`
          : `rgba(107, 79, 232, ${s.alpha * 0.18})`
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
        ctx.stroke()

        // Push nearby particles
        for (let pIdx = 0; pIdx < particles.length; pIdx++) {
          const p = particles[pIdx]
          const dx = p.x - s.x
          const dy = p.y - s.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const ringThickness = 35

          if (Math.abs(dist - s.radius) < ringThickness) {
            const pushFactor = (1 - Math.abs(dist - s.radius) / ringThickness) * s.strength * s.alpha
            // push vector
            p.vx += (dx / (dist || 1)) * pushFactor * 0.15
            p.vy += (dy / (dist || 1)) * pushFactor * 0.15
          }
        }
      }

      // 3. Update and draw packets
      for (let pIdx = packets.length - 1; pIdx >= 0; pIdx--) {
        const pack = packets[pIdx]
        pack.progress += pack.speed

        if (pack.progress >= 1) {
          packets.splice(pIdx, 1)
          continue
        }

        const px = pack.from.x + (pack.to.x - pack.from.x) * pack.progress
        const py = pack.from.y + (pack.to.y - pack.from.y) * pack.progress

        // Pulse packet size
        const pSize = 2.5 + Math.sin(pack.progress * Math.PI * 4) * 0.8

        ctx.shadowColor = pack.color
        ctx.shadowBlur = theme === "dark" ? 8 : 4
        ctx.fillStyle = pack.color
        ctx.beginPath()
        ctx.arc(px, py, pSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0 // reset shadow
      }

      // 4. Update and draw sparks
      if (theme === "dark" && Math.random() < 0.25) {
        const sparkCount = Math.floor(Math.random() * 2) + 1
        for (let s = 0; s < sparkCount; s++) {
          const angle = Math.random() * Math.PI * 2
          const speed = Math.random() * 2.2 + 0.8
          const size = Math.random() * 1.5 + 0.6
          const colors = [
            "rgba(139, 111, 255, 1)",   // bright violet
            "rgba(184, 164, 255, 1)",   // neon purple
            "rgba(107, 79, 232, 1)",    // purple
            "rgba(255, 255, 255, 0.95)", // bright white-lavender
          ]
          const color = colors[Math.floor(Math.random() * colors.length)]
          sparks.push({
            x: width / 2,
            y: height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size,
            color,
            alpha: 1,
            life: 0,
            maxLife: 30 + Math.random() * 30, // 30 to 60 frames
          })
        }
      }

      for (let sIdx = sparks.length - 1; sIdx >= 0; sIdx--) {
        const s = sparks[sIdx]
        s.x += s.vx
        s.y += s.vy
        s.vx *= 0.93 // friction decay
        s.vy *= 0.93
        s.life++
        s.alpha = Math.max(0, 1 - s.life / s.maxLife)

        if (s.life >= s.maxLife) {
          sparks.splice(sIdx, 1)
          continue
        }

        ctx.fillStyle = s.color.replace("1)", `${s.alpha}`).replace("0.95)", `${s.alpha * 0.95}`)
        ctx.shadowColor = "rgba(139, 111, 255, 0.8)"
        ctx.shadowBlur = theme === "dark" ? 6 : 0
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // 5. Update and draw particles
      particles.forEach((p) => {
        // Move particle
        p.x += p.vx
        p.y += p.vy

        // Ambient drift limit
        p.pulsePhase += p.pulseSpeed
        const currentAlpha = p.alpha + Math.sin(p.pulsePhase) * 0.12

        // Mouse gravity pull
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x
          const dy = mouseRef.current.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const gravityRadius = 180

          if (dist < gravityRadius && dist > 0) {
            const pullStrength = (gravityRadius - dist) / gravityRadius
            // Accelerate slightly towards mouse
            p.vx += (dx / dist) * pullStrength * 0.05
            p.vy += (dy / dist) * pullStrength * 0.05
          }
        }

        // Friction / drag (limit speed build-up)
        p.vx *= 0.94
        p.vy *= 0.94

        // Add baseline low velocity drift
        if (theme === "dark") {
          // Zero-G upward float force vector & horizontal sway
          p.vy -= 0.012
          p.vx += Math.sin(p.pulsePhase) * 0.006
        } else {
          p.vx += (Math.random() - 0.5) * 0.06
          p.vy += (Math.random() - 0.5) * 0.06
        }

        // Clamp speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        const speedLimit = p.isMainNode ? 0.75 : 1.4
        if (speed > speedLimit) {
          p.vx = (p.vx / speed) * speedLimit
          p.vy = (p.vy / speed) * speedLimit
        }

        // Boundary behavior
        if (theme === "dark") {
          // Wrap particles at edges for weightless endless drifting feel
          if (p.x < -15) {
            p.x = width + 15
          } else if (p.x > width + 15) {
            p.x = -15
          }

          if (p.y < -15) {
            p.y = height + 15
            p.x = Math.random() * width
            p.vy = -Math.random() * (p.isMainNode ? 0.35 : 0.6) - 0.1
          } else if (p.y > height + 15) {
            p.y = -15
            p.x = Math.random() * width
          }
        } else {
          // Bounce off canvas edges with elastic damping
          const margin = 10
          if (p.x < margin) {
            p.x = margin
            p.vx *= -0.8
          } else if (p.x > width - margin) {
            p.x = width - margin
            p.vx *= -0.8
          }

          if (p.y < margin) {
            p.y = margin
            p.vy *= -0.8
          } else if (p.y > height - margin) {
            p.y = height - margin
            p.vy *= -0.8
          }
        }

        // Draw particle
        ctx.fillStyle = p.baseColor.replace("1)", `${Math.max(0.1, Math.min(1, currentAlpha))}`)
        
        // Main nodes have glowing dropshadows
        if (p.isMainNode) {
          ctx.shadowColor = p.baseColor
          ctx.shadowBlur = theme === "dark" ? 10 : 5
        }
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        
        if (p.isMainNode) {
          ctx.shadowBlur = 0 // reset shadow
        }
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    // Page visibility check to save resources when tab is idle
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        cancelAnimationFrame(animationFrameId)
        animate()
      } else {
        cancelAnimationFrame(animationFrameId)
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Start loop
    animate()

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("click", handleWindowClick)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchend", handleMouseLeave)
      
      cancelAnimationFrame(animationFrameId)
    }
  }, [theme, particleCountOverride])

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 h-full w-full pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <canvas ref={canvasRef} className="block h-full w-full opacity-90 pointer-events-none" />
    </div>
  )
}
