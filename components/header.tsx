"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Trophy } from "lucide-react"
import { useState, useEffect } from "react"

export function Header() {
  const pathname = usePathname()
  const [tournamentFlipped, setTournamentFlipped] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const isRegisterPage = pathname === "/register"

  useEffect(() => {
    if (isRegisterPage) return
    const handleScroll = () => {
      const rulesSection = document.getElementById("rules")
      const detailsSection = document.getElementById("details")
      let currentTab = "home"
      
      if (detailsSection && detailsSection.getBoundingClientRect().top <= 400) {
        // Between details and rules
        currentTab = "home" 
      }
      if (rulesSection && rulesSection.getBoundingClientRect().top <= 400) {
        currentTab = "rules"
      }
      setActiveTab(currentTab)
    }
    
    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isRegisterPage])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-primary/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30 group-hover:border-primary transition-colors">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <span className="font-mono text-xl font-bold tracking-tighter text-white">
            DISTOPIA<span className="text-primary">_X</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/" 
            className={`text-sm font-mono tracking-widest transition-colors ${!isRegisterPage && activeTab === "home" ? "text-primary text-shadow-sm" : "text-muted-foreground hover:text-white"}`}
          >
            HOME
          </Link>
          <div 
            className={`relative cursor-pointer h-6 w-[120px] flex items-center justify-center text-sm font-mono tracking-widest transition-colors ${!isRegisterPage && tournamentFlipped ? "text-primary text-shadow-sm" : "text-muted-foreground hover:text-white"}`}
            onClick={() => setTournamentFlipped(!tournamentFlipped)}
            style={{ perspective: "1000px" }}
          >
            <div 
              className="absolute inset-0 w-full h-full transition-transform duration-500"
              style={{ transformStyle: "preserve-3d", transform: tournamentFlipped ? "rotateX(180deg)" : "rotateX(0deg)" }}
            >
              {/* Front */}
              <div 
                className="absolute inset-0 w-full h-full flex items-center justify-center text-center"
                style={{ backfaceVisibility: "hidden" }}
              >
                TOURNAMENT
              </div>
              {/* Back */}
              <div 
                className="absolute inset-0 w-[160px] -left-[20px] h-[36px] -top-[6px] flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: "hidden", transform: "rotateX(180deg)" }}
              >
                <span className="text-[11px] text-white font-bold tracking-widest leading-none">APRIL 11, 2026</span>
                <span className="text-[9px] text-primary tracking-widest leading-none mt-[4px]">BGMI ESPORTS</span>
              </div>
            </div>
          </div>
          <Link 
            href="/#rules" 
            className={`text-sm font-mono tracking-widest transition-colors ${!isRegisterPage && activeTab === "rules" ? "text-primary text-shadow-sm" : "text-muted-foreground hover:text-white"}`}
          >
            RULES
          </Link>
        </nav>

        <div>
          {!isRegisterPage ? (
            <Link
              href="/register"
              className="relative inline-flex items-center justify-center px-6 py-2 text-sm font-bold font-mono tracking-widest bg-primary text-white rounded-none overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)" }}
            >
              REGISTER NOW
            </Link>
          ) : (
            <Link
              href="/"
              className="relative inline-flex items-center justify-center px-6 py-2 text-sm font-bold font-mono tracking-widest border border-primary text-primary hover:bg-primary hover:text-white rounded-none overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)" }}
            >
              BACK HOME
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
