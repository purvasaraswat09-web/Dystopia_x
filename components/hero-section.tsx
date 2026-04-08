"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function HeroSection() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  // Set tournament date - 11 April 2026
  const targetDate = new Date("2026-04-11T10:00:00")

  useEffect(() => {
    setMounted(true)

    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])


  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden noise-overlay scanline">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.png"
          alt="Esports Battleground Background"
          fill
          priority
          quality={100}
          className="object-cover transition-transform duration-[20s] hover:scale-105"
        />
        {/* Gradients to blend text nicely (toned down) */}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Particle effect simulation for more energy */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {mounted && [...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] bg-primary/80 rounded-full animate-float blur-[1px]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
        <p className="text-white font-bold font-mono tracking-[0.4em] text-sm md:text-md mb-4 uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
          College eSports Championship
        </p>

        <h1 className="font-mono text-5xl md:text-7xl lg:text-9xl font-bold tracking-wider mb-6 animate-glitch relative">
          <span className="relative z-10 text-white drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]">
            DISTOPIA_X
          </span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-2xl mb-12 tracking-wide font-sans mt-8 bg-black/40 inline-block px-6 py-2 rounded-full border border-primary/20 backdrop-blur-sm">
          ENTER THE BATTLEGROUND. <span className="text-primary font-bold">CLAIM YOUR LEGACY.</span>
        </p>

        {/* Countdown Timer */}
        <div className="flex justify-center gap-3 md:gap-8 mb-12">
          {[
            { label: "DAYS", value: timeLeft.days },
            { label: "HOURS", value: timeLeft.hours },
            { label: "MINS", value: timeLeft.minutes },
            { label: "SECS", value: timeLeft.seconds },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center glass border border-primary/30 rounded-xl p-4 md:p-6 min-w-[80px] md:min-w-[110px] backdrop-blur-md shadow-[0_0_20px_rgba(255,0,0,0.15)]"
            >
              <span className="font-mono text-3xl md:text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
                {String(item.value).padStart(2, "0")}
              </span>
              <span className="text-xs md:text-sm text-primary tracking-widest mt-2 font-bold uppercase">
                {item.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
