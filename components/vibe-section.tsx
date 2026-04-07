"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"

export function VibeSection() {
  const [displayText, setDisplayText] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  // The intense typing text
  const fullText = "MASKED. MARKED. WATCHED."

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, 80)

    return () => clearInterval(interval)
  }, [isVisible])

  return (
    <section
      ref={sectionRef}
      className="relative py-48 md:py-64 flex items-center justify-center overflow-hidden noise-overlay"
    >
      {/* Background Image Layer with Parallax feel */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/vibe-bg.png"
          alt="Massive Esports Arena Stadium"
          fill
          quality={100}
          className="object-cover opacity-40 brightness-75 contrast-125 transition-transform duration-1000 saturate-[1.2]"
          style={{ transform: isVisible ? 'scale(1)' : 'scale(1.1)' }}
        />
        {/* Gradients to fade out the top and bottom into the site */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background opacity-90" />
        {/* Dynamic intense red vignette */}
        <div className="absolute inset-0 bg-radial-[circle_at_center] from-transparent via-background/60 to-background" />
      </div>

      {/* Intense Red glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />

      <div className="relative z-10 text-center px-4">
        {/* Distressed Glitch Container */}
        <div className="relative inline-block">
          <h2 className="font-mono text-4xl md:text-6xl lg:text-8xl font-bold tracking-[0.2em] text-white drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]">
            {displayText}
            <span className="inline-block w-[6px] h-[1em] bg-primary ml-4 translate-y-2 animate-pulse-glow" />
          </h2>
          {/* Subtle reflection/shadow glitch layer behind text */}
          <h2 className="font-mono text-4xl md:text-6xl lg:text-8xl font-bold tracking-[0.2em] text-primary/30 absolute top-[2px] left-[-4px] z-[-1] blur-[2px] opacity-70">
            {displayText}
          </h2>
        </div>

        <p className="mt-12 text-muted-foreground text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed border-l-4 border-primary pl-6 font-sans backdrop-blur-sm bg-black/30 py-4 opacity-0 animate-[fadeIn_1s_ease_forwards_2.5s] shadow-[0_0_15px_rgba(255,0,0,0.1)]">
          The arena awaits. Only the worthy will survive. <br />
          <span className="text-white font-bold tracking-wide mt-2 block">
            ARE YOU READY TO PROVE YOURSELF?
          </span>
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  )
}
