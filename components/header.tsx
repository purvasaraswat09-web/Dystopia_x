"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Trophy, Loader2, X, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { db } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [tournamentFlipped, setTournamentFlipped] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const isRegisterPage = pathname === "/register"

  // Login State
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loginPhone, setLoginPhone] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    if (loginPhone.length !== 10) {
      setLoginError("Please enter a valid 10-digit number")
      return
    }
    
    setIsLoggingIn(true)
    try {
      const docRef = doc(db, "registrations", loginPhone)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        localStorage.setItem("temp_phone", loginPhone)
        setIsLoginOpen(false)
        router.push("/register")
      } else {
        setLoginError("No registration found with this WhatsApp number.")
      }
    } catch (error) {
      setLoginError("Error checking registration. Please try again.")
    } finally {
      setIsLoggingIn(false)
    }
  }

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
            DYSTOPIA<span className="text-primary">_X</span>
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
            <button
              onClick={() => setIsLoginOpen(true)}
              className="relative inline-flex items-center justify-center px-6 py-2 text-sm font-bold font-mono tracking-widest bg-primary text-white rounded-none overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              style={{ clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)" }}
            >
              LOGIN
            </button>
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

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="glass relative max-w-sm w-full p-8 rounded-2xl border border-primary/30 shadow-[0_0_40px_rgba(255,0,60,0.2)] animate-in zoom-in-95 duration-300">
             <button onClick={() => setIsLoginOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors">
               <X className="w-5 h-5" />
             </button>
             
             <h3 className="font-mono text-2xl font-bold mb-2 uppercase italic text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Login
             </h3>
             <p className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-mono mb-6">Enter your Squad's WhatsApp Number to see your transaction status.</p>
             
             <form onSubmit={handleLogin} className="space-y-4">
                <div>
                   <input
                     type="tel"
                     maxLength={10}
                     placeholder="10-digit phone number"
                     value={loginPhone}
                     onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                     className="w-full bg-background/50 border border-border rounded-xl px-4 py-4 outline-none focus:border-primary transition-all font-mono tracking-widest text-center shadow-inner"
                   />
                </div>
                
                {loginError && (
                  <p className="text-red-500 text-[10px] font-mono flex items-center justify-center gap-1 uppercase tracking-wider text-center">
                     <AlertCircle className="w-3 h-3 flex-shrink-0" /> {loginError}
                  </p>
                )}
                
                <button
                  type="submit"
                  disabled={isLoggingIn || loginPhone.length !== 10}
                  className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold tracking-widest rounded-xl shadow-[0_0_20px_rgba(255,0,60,0.3)] border border-primary/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm"
                >
                  {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  CHECK STATUS
                </button>
             </form>
          </div>
        </div>
      )}
    </header>
  )
}
