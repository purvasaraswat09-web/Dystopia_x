"use client"

import { useState, useEffect } from "react"
import { Trophy, Calendar, Ticket, Swords, Skull } from "lucide-react"

const details = [
  {
    icon: Trophy,
    title: "Prize Pool",
    value: (
      <span className="flex flex-col gap-1">
        <span className="text-2xl md:text-3xl">BGMI - ₹2000</span>
        <span className="text-2xl md:text-23xl text-primary">Free Fire - ₹1100</span>
      </span>
    ),
  },
  {
    icon: Calendar,
    title: "Date & Time",
    value: "April 11, 2026",
    description: "Registration closes April 8th, 11:59 PM",
  },
  {
    icon: Ticket,
    title: "Entry Fee",
    value: "₹199/Squad",
    //description: "Early bird: ₹149 (ends May 1st)",
  },
]

const progressionSteps = [
  {
    id: "qualifiers",
    title: "QUALIFIERS",
    icon: Swords,
    secondaryText: "TOP 10 → SEMI",
    map: "Erangel",
    teams: "25 Teams",
    highlight: false,
  },
  {
    id: "semi-finals",
    title: "SEMI FINAL",
    icon: Skull,
    secondaryText: "TOP 4 → FINAL",
    map: "Sanhok",
    teams: "10 Teams",
    highlight: true,
  },
  {
    id: "grand-finals",
    title: "GRAND FINAL",
    icon: Trophy,
    secondaryText: "ULTIMATE CHAMPION",
    map: "Livik",
    teams: "4 Teams",
    highlight: false,
    trophyIcon: true,
  },
]

export function TournamentDetails() {
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (flippedIndex !== null) {
      const timer = setTimeout(() => {
        setFlippedIndex(null)
      }, 15000)
      return () => clearTimeout(timer)
    }
  }, [flippedIndex])

  return (
    <section id="details" className="relative py-24 md:py-32 overflow-hidden noise-overlay">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary font-mono tracking-[0.3em] text-sm uppercase mb-4">
            Tournament Info
          </p>
          <h2 className="font-mono text-3xl md:text-5xl font-bold tracking-wide">
            THE STAKES ARE HIGH
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-24">
          {details.map((detail, index) => (
            <div
              key={detail.title}
              className="group relative glass rounded-xl p-8 transition-all duration-500 hover:scale-105 hover:border-primary/50 glow-border"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                <detail.icon className="w-7 h-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-sm font-mono tracking-widest text-muted-foreground uppercase mb-2">
                {detail.title}
              </h3>
              <div className="text-3xl md:text-4xl font-mono font-bold text-foreground mb-3 group-hover:text-white transition-colors">
                {detail.value}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {detail.description}
              </p>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-[1px] h-8 bg-gradient-to-b from-primary/50 to-transparent" />
                <div className="absolute top-0 right-0 w-8 h-[1px] bg-gradient-to-l from-primary/50 to-transparent" />
              </div>
            </div>
          ))}
        </div>

        {/* Tournament Progression */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="font-mono text-2xl md:text-4xl font-bold tracking-wide text-foreground">
              TOURNAMENT <span className="text-primary">PROGRESSION</span>
            </h3>
            <p className="text-muted-foreground mt-2 font-mono tracking-widest uppercase text-sm">Survival of the Fittest</p>
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6 pt-4">
            {/* Connecting Line */}
            <div className="absolute hidden md:block top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10 -translate-y-1/2 z-0" />
            <div className="absolute md:hidden left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/10 via-primary to-primary/10 -translate-x-1/2 z-0" />

            {progressionSteps.map((step, index) => (
              <div 
                key={step.id}
                className="w-full md:w-1/3 h-[400px] perspective-1000 group cursor-pointer"
                onClick={() => setFlippedIndex(flippedIndex === index ? null : index)}
              >
                <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${flippedIndex === index ? 'rotate-y-180' : ''}`}>
                  
                  {/* Front Side */}
                  <div className={`absolute inset-0 backface-hidden glass rounded-xl flex flex-col items-center justify-center p-8 border glow-border ${step.highlight ? 'border-primary/40 md:scale-110 shadow-[0_0_30px_rgba(255,0,0,0.15)] bg-background/95' : 'border-primary/20 bg-background/90'}`}>
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(255,0,0,0.3)] transition-transform ${step.trophyIcon ? 'bg-primary' : 'bg-background border-2 border-primary'}`}>
                      <step.icon className={`w-8 h-8 md:w-10 md:h-10 ${step.trophyIcon ? 'text-black' : 'text-primary'}`} />
                    </div>
                    <h4 className={`font-mono text-2xl font-bold mb-4 ${step.highlight ? 'md:text-3xl text-white drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]' : 'text-foreground'}`}>
                      {step.title}
                    </h4>
                    <div className={`inline-block border rounded-full py-1 px-4 ${step.highlight ? 'border-primary bg-primary/20' : 'border-primary/30 bg-primary/5'}`}>
                      <p className={`text-sm font-bold tracking-wide ${step.highlight ? 'text-white' : 'text-primary'}`}>
                        {step.secondaryText}
                      </p>
                    </div>
                    <p className="mt-6 text-[10px] font-mono text-muted-foreground uppercase animate-pulse">Click to Reveal Specs</p>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 backface-hidden glass rounded-xl border border-primary/60 bg-black/95 flex flex-col items-center justify-center p-8 rotate-y-180 shadow-[0_0_30px_rgba(255,0,0,0.5)]">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 border border-primary/30">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-mono text-primary mb-2 text-xs tracking-widest uppercase">Match Intelligence</p>
                    <div className="space-y-4 text-center">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase mb-1">Combat Map</p>
                        <p className="text-xl font-bold text-white uppercase tracking-tight">{step.map}</p>
                      </div>
                      <div className="w-12 h-[1px] bg-primary/30 mx-auto" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase mb-1">Engaged Squads</p>
                        <p className="text-xl font-bold text-red-500 uppercase tracking-tight">{step.teams}</p>
                      </div>
                    </div>
                    <p className="mt-8 text-[9px] font-mono text-primary/60 uppercase italic">Auto-resets in 15s</p>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
