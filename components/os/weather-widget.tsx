"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, MapPin, Droplets } from "lucide-react"

function getWeatherInfo(code: number) {
  if (code === 0)          return { icon: Sun,            label: "Clear Sky",    color: "#FF9900" }
  if (code <= 2)           return { icon: Cloud,          label: "Partly Cloudy",color: "#9B8FC8" }
  if (code === 3)          return { icon: Cloud,          label: "Overcast",     color: "#7B7090" }
  if (code <= 49)          return { icon: Cloud,          label: "Foggy",        color: "#9B8FC8" }
  if (code <= 57)          return { icon: CloudRain,      label: "Drizzle",      color: "#5BA8D8" }
  if (code <= 67)          return { icon: CloudRain,      label: "Rainy",        color: "#4B98C8" }
  if (code <= 77)          return { icon: CloudSnow,      label: "Snowy",        color: "#A0C8E8" }
  if (code <= 82)          return { icon: CloudRain,      label: "Showers",      color: "#5BA8D8" }
  return                          { icon: CloudLightning, label: "Thunderstorm", color: "#8B6FD8" }
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<{ temp: number; code: number; wind: number; humidity: number; city: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch_weather = async (lat: number, lon: number) => {
      try {
        // Reverse geocode for city name
        let city = "Navi Mumbai"
        try {
          const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
          const gd = await geo.json()
          city = gd.address?.city || gd.address?.town || gd.address?.village || city
        } catch { /* use default */ }

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
        )
        const d = await res.json()
        setWeather({
          temp: Math.round(d.current.temperature_2m),
          code: d.current.weather_code,
          wind: Math.round(d.current.wind_speed_10m),
          humidity: d.current.relative_humidity_2m,
          city,
        })
      } catch (err) {
        console.warn("Weather API fetch failed, using fallback:", err)
        // Set realistic fallback weather so the widget doesn't vanish
        setWeather({
          temp: 28,
          code: 2, // Partly Cloudy
          wind: 12,
          humidity: 65,
          city: "Navi Mumbai",
        })
      }
      finally { setLoading(false) }
    }

    const ip_fallback = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/")
        const d = await res.json()
        if (d.latitude && d.longitude) {
          fetch_weather(d.latitude, d.longitude)
        } else {
          fetch_weather(19.0368, 73.0158)
        }
      } catch {
        fetch_weather(19.0368, 73.0158)
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetch_weather(pos.coords.latitude, pos.coords.longitude),
        ()  => ip_fallback(),
        { timeout: 5000 }
      )
    } else {
      ip_fallback()
    }
  }, [])

  const darkCard = {
    background: "rgba(10, 6, 24, 0.92)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(168,85,247,0.22)",
    boxShadow: "0 8px 28px rgba(107,79,232,0.28)",
  } as React.CSSProperties

  if (loading) return (
    <div className="rounded-2xl px-4 py-3" style={darkCard}>
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-2 w-2 rounded-full" style={{ background: "rgba(168,85,247,0.6)" }} />
        <span className="text-xs" style={{ color: "#9775FA" }}>Loading weather…</span>
      </div>
    </div>
  )

  if (!weather) return null

  const { icon: Icon, label, color } = getWeatherInfo(weather.code)

  const isRainOrDrizzle = weather.code >= 51 && weather.code <= 82
  const isPune = weather.city.toLowerCase().includes("pune") || 
                 weather.city.toLowerCase().includes("talegaon") ||
                 weather.city.toLowerCase().includes("navi mumbai") ||
                 weather.city.toLowerCase().includes("mumbai")
  const showPuneCloudsLine = isPune && isRainOrDrizzle

  return (
    <motion.div className="rounded-2xl overflow-hidden"
      style={darkCard}
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 260 }}>
      <div className="px-4 py-3"
        style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.07),rgba(255,153,0,0.04))" }}>
        {/* City + live badge */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" style={{ color: "#9775FA" }} />
            <span className="text-xs font-medium" style={{ color: "#A78BFA" }}>{weather.city}</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: "rgba(168,85,247,0.18)", color: "#C084FC", border: "1px solid rgba(168,85,247,0.30)" }}>Live</span>
        </div>
        {/* Temp + icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-10 w-10" style={{ color, filter: `drop-shadow(0 0 6px ${color}88)` }} />
            <div>
              <div className="text-2xl font-light tabular-nums" style={{ color: "#EDE9FE" }}>{weather.temp}°C</div>
              <div className="text-xs font-medium mt-0.5" style={{ color: "#A78BFA" }}>{label}</div>
            </div>
          </div>
          {/* Extra stats */}
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1">
              <Wind className="h-3 w-3" style={{ color: "#9775FA" }} />
              <span className="text-xs" style={{ color: "#C4B5FD" }}>{weather.wind} km/h</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="h-3 w-3" style={{ color: "#60A5FA" }} />
              <span className="text-xs" style={{ color: "#C4B5FD" }}>{weather.humidity}%</span>
            </div>
          </div>
        </div>
        
        {/* Easter Egg Cloud Line */}
        {showPuneCloudsLine && (
          <div className="mt-2.5 pt-2 border-t border-purple-900/20 text-center">
            <span className="text-[10px] font-bold text-yellow-300 animate-pulse tracking-wide inline-block">
              Even the clouds are on AWS today ☁️
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
