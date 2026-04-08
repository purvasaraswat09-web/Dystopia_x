"use client"

import { Trophy, Calendar, Ticket, Swords, Skull } from "lucide-react"

const details = [
  {
    icon: Trophy,
    title: "Prize Pool",
    value: "₹2000",
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

export function TournamentDetails() {
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
              <p className="text-3xl md:text-4xl font-mono font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {detail.value}
              </p>
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

            {/* Step 1: Qualifiers */}
            <div className="group glass relative z-10 w-full md:w-1/3 flex flex-col items-center text-center p-8 rounded-xl border border-primary/20 glow-border bg-background/90 backdrop-blur-xl">
              <div className="w-16 h-16 rounded-full bg-background border-2 border-primary flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(255,0,0,0.3)] group-hover:scale-110 transition-transform">
                <Swords className="w-8 h-8 text-primary group-hover:text-red-500 transition-colors" />
              </div>
              
              <div className="relative mb-4 flex flex-col items-center">
                <h4 className="font-mono text-2xl font-bold cursor-help border-b border-dashed border-primary/50 pb-1">QUALIFIERS</h4>
                
                {/* Dropdown / Tooltip */}
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-64 p-4 rounded-xl bg-black/95 border border-primary/60 text-sm text-center text-white opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 shadow-[0_0_30px_rgba(255,0,0,0.5)] pointer-events-none">
                  {/* Arrow Indicator */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-primary/60"></div>
                  
                  <p className="font-mono text-primary mb-2 text-xs tracking-widest uppercase">Match Info</p>
                  <p className="leading-relaxed">Match played on <span className="font-bold text-white">Erangel</span> map.</p>
                  <p className="text-red-400 mt-1 font-bold">25 Teams play match.</p>
                </div>
              </div>

              <div className="inline-block border border-primary/30 rounded-full py-1 px-4 bg-primary/5">
                <p className="text-white text-sm font-bold tracking-wide">
                  TOP 10 <span className="text-primary">→</span> SEMI
                </p>
              </div>
            </div>

            {/* Step 2: Semi Finals */}
            <div className="group glass relative z-10 w-full md:w-1/3 flex flex-col items-center text-center p-8 rounded-xl border-2 border-primary/40 glow-border bg-background/90 backdrop-blur-xl md:scale-110 shadow-[0_0_30px_rgba(255,0,0,0.15)] hover:bg-background/95 transition-colors">
              <div className="w-20 h-20 rounded-full bg-background border-2 border-primary flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,0,0,0.6)] group-hover:scale-110 transition-transform">
                <Skull className="w-10 h-10 text-primary group-hover:text-red-500 transition-colors" />
              </div>
              
              <div className="relative mb-4 flex flex-col items-center">
                <h4 className="font-mono text-2xl md:text-3xl font-bold cursor-help border-b border-dashed border-primary/50 pb-1 text-white drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]">SEMI FINAL</h4>
                
                {/* Dropdown / Tooltip */}
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-64 p-4 rounded-xl bg-black/95 border border-primary/60 text-sm text-center text-white opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 shadow-[0_0_30px_rgba(255,0,0,0.5)] pointer-events-none">
                  {/* Arrow Indicator */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-primary/60"></div>
                  
                  <p className="font-mono text-primary mb-2 text-xs tracking-widest uppercase">Match Info</p>
                  <p className="leading-relaxed">Match played on <span className="font-bold text-white">Sanhok</span> map.</p>
                  <p className="text-red-400 mt-1 font-bold">10 Teams play match.</p>
                </div>
              </div>

              <div className="inline-block border border-primary rounded-full py-1 px-4 bg-primary/20">
                <p className="text-white text-md font-bold tracking-wide">
                  TOP 4 <span className="text-primary">→</span> FINAL
                </p>
              </div>
            </div>

            {/* Step 3: Grand Finals */}
            <div className="group glass relative z-10 w-full md:w-1/3 flex flex-col items-center text-center p-8 rounded-xl border border-primary/20 glow-border bg-background/90 backdrop-blur-xl hover:bg-background/95 transition-colors">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(255,0,0,0.8)] group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8 text-black" />
              </div>
              
              <div className="relative mb-4 flex flex-col items-center">
                <h4 className="font-mono text-2xl font-bold cursor-help border-b border-dashed border-primary/50 pb-1 text-primary">GRAND FINAL</h4>
                
                {/* Dropdown / Tooltip */}
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-64 p-4 rounded-xl bg-black/95 border border-primary/60 text-sm text-center text-white opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 shadow-[0_0_30px_rgba(255,0,0,0.5)] pointer-events-none">
                  {/* Arrow Indicator */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-primary/60"></div>
                  
                  <p className="font-mono text-primary mb-2 text-xs tracking-widest uppercase">Match Info</p>
                  <p className="leading-relaxed">Match played on <span className="font-bold text-white">Livik</span> map.</p>
                  <p className="text-red-400 mt-1 font-bold">4 Teams play match.</p>
                </div>
              </div>

              <div className="inline-block border border-primary/30 rounded-full py-1 px-4 bg-primary/5">
                <p className="text-muted-foreground text-sm font-bold tracking-wide group-hover:text-white transition-colors">
                  ULTIMATE CHAMPION
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
