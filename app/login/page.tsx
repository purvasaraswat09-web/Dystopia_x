"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import { Trophy, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [squadName, setSquadName] = useState("")
  const [phone, setPhone] = useState("")
  const [game, setGame] = useState("BGMI")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    
    if (!squadName.trim()) {
      setLoginError("Please enter your Squad Name")
      return
    }
    
    if (phone.length !== 10) {
      setLoginError("Please enter a valid 10-digit WhatsApp number")
      return
    }

    setIsLoggingIn(true)
    try {
      const docRef = doc(db, "registrations", phone)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        
        // Verify game matches
        const dbGame = data.game || "BGMI"
        if (dbGame !== game) {
          setLoginError(`This squad is registered for ${dbGame}, not ${game}.`)
          return
        }

        // Verify both phone and squad name match (case insensitive)
        const dbSquadName = data.teamName || ""
        if (dbSquadName.toLowerCase().trim() === squadName.toLowerCase().trim()) {
          // Success! Save session and redirect
          localStorage.setItem("temp_phone", phone)
          router.push("/register")
        } else {
          setLoginError("Squad name does not match the registered number.")
        }
      } else {
        setLoginError("No registration found with this WhatsApp number.")
      }
    } catch (error) {
      setLoginError("Error checking registration. Please try again.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <main className="relative min-h-screen bg-background flex flex-col pt-20 overflow-hidden noise-overlay">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] z-0" />

      <div className="container relative z-10 mx-auto px-4 py-12 flex-1 flex flex-col items-center justify-center">
        
        <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-500">
          
          <div className="flex justify-start mb-6 w-full">
            <button type="button" onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-2 font-mono uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>

          <div className="glass rounded-[2rem] p-8 md:p-10 border border-primary/20 shadow-[0_0_50px_rgba(255,0,60,0.15)] relative overflow-hidden">
            
            {/* Top Accents */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-inner">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-mono font-black italic uppercase text-white tracking-tighter mb-2 drop-shadow-[0_0_10px_rgba(255,0,60,0.5)]">
                Squad Access
              </h2>
              <p className="text-muted-foreground text-[10px] font-mono tracking-[0.2em] uppercase">
                Verify Credentials to view Status
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">
                    Combat Theater
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-background/50 border rounded-xl cursor-pointer transition-all duration-300 ${game === 'BGMI' ? 'border-primary text-primary shadow-[0_0_15px_rgba(255,0,0,0.2)] scale-[1.02]' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-white'}`}>
                      <input type="radio" name="game" value="BGMI" checked={game === 'BGMI'} onChange={(e) => setGame(e.target.value)} className="hidden" />
                      <span className="font-bold tracking-widest uppercase font-mono text-xs">BGMI</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-background/50 border rounded-xl cursor-pointer transition-all duration-300 ${game === 'Free Fire' ? 'border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] scale-[1.02]' : 'border-border text-muted-foreground hover:border-red-500/50 hover:text-white'}`}>
                      <input type="radio" name="game" value="Free Fire" checked={game === 'Free Fire'} onChange={(e) => setGame(e.target.value)} className="hidden" />
                      <span className="font-bold tracking-widest uppercase font-mono text-xs">FREE FIRE</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
                    Registered Squad Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter EXACT squad name"
                    value={squadName}
                    onChange={(e) => setSquadName(e.target.value)}
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-4 outline-none focus:border-primary transition-all font-mono tracking-widest shadow-inner placeholder:text-muted-foreground/30"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
                    Captain's WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-4 outline-none focus:border-primary transition-all font-mono tracking-widest text-left shadow-inner placeholder:text-muted-foreground/30"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-pulse">
                  <p className="text-red-500 text-[10px] font-mono flex items-center justify-center gap-1 uppercase tracking-wider text-center">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {loginError}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn || phone.length !== 10 || !squadName}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold tracking-widest rounded-xl shadow-[0_0_20px_rgba(255,0,60,0.3)] border-b-4 border-red-900 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm active:border-b-0 active:translate-y-1 relative group overflow-hidden mt-6"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                    <span className="relative z-10">Authenticating...</span>
                  </>
                ) : (
                  <span className="relative z-10">Verify & Check Status</span>
                )}
              </button>

            </form>
          </div>

          <div className="mt-8 text-center">
             <Link href="/register" className="font-mono text-xs text-muted-foreground hover:text-white uppercase tracking-widest transition-colors">
               Not Registered? <span className="text-primary underline decoration-primary/50 underline-offset-4">Sign Up Here</span>
             </Link>
          </div>

        </div>
      </div>
    </main>
  )
}
