"use client"

import { useState, useEffect } from "react"
import { db } from "@/firebase"
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { CheckCircle, XCircle, Eye, Loader2, ShieldCheck, Search, Image as ImageIcon, Users, Phone, Zap } from "lucide-react"
import { toast } from "sonner"

interface RegistrationData {
  id: string
  name: string
  teamName: string
  phone: string
  gameUid: string
  player2Uid: string
  player3Uid: string
  player4Uid: string
  utrId: string
  payerName: string
  status: "pending_payment" | "pending" | "approved" | "rejected"
  screenshotUrl?: string
  submittedAt: number
}

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([])
  const [loading, setLoading] = useState(true)
  const [passcode, setPasscode] = useState("")
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedImg, setSelectedImg] = useState<string | null>(null)

  const ADMIN_PASSCODE = "112233"

  useEffect(() => {
    if (!isAuthorized) return

    const q = query(collection(db, "registrations"), orderBy("submittedAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RegistrationData[]
      setRegistrations(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [isAuthorized])

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode === ADMIN_PASSCODE) {
      setIsAuthorized(true)
      toast.success("Identity Verified. Systems Online.")
    } else {
      toast.error("Access Denied.")
    }
  }

  const handleStatusUpdate = async (id: string, status: "approved" | "rejected") => {
    try {
      const regRef = doc(db, "registrations", id)
      await updateDoc(regRef, { status })
      toast.success(`Entry ${status.toUpperCase()}!`)
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Operation Failed.")
    }
  }

  const filteredRegs = registrations.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.utrId && r.utrId.includes(searchTerm)) ||
      r.phone.includes(searchTerm)
  )

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form onSubmit={handleAuth} className="glass p-10 rounded-[2rem] border border-primary/30 max-w-sm w-full text-center shadow-[0_0_50px_rgba(255,0,60,0.2)]">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-mono font-black mb-2 uppercase tracking-tighter italic">ADMIN CORE</h1>
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest mb-10">Restricted Sector 01</p>
          
          <div className="relative mb-8">
            <input
              type="password"
              placeholder="ENTER PASSCODE"
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-4 focus:border-primary outline-none text-center font-mono tracking-[1em] text-lg transition-all"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />
          </div>
          
          <button className="w-full py-5 bg-primary text-white font-bold rounded-xl shadow-[0_0_20px_rgba(255,0,60,0.4)] hover:bg-primary/90 transition-all border-b-4 border-red-900 active:border-b-0 active:translate-y-1">
            INITIALIZE SESSION
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 pt-28">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-8 mb-16">
          <div className="text-center xl:text-left">
            <h1 className="text-5xl font-mono font-black italic uppercase tracking-tighter flex items-center gap-4 justify-center xl:justify-start">
              <Zap className="text-primary w-10 h-10 fill-primary" />
              SQUAD <span className="text-primary">VERIFIER</span>
            </h1>
            <p className="text-muted-foreground mt-4 font-mono text-xs uppercase tracking-[0.4em] flex items-center gap-2 justify-center xl:justify-start">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Real-time submission monitoring active
            </p>
          </div>

          <div className="relative w-full md:w-[500px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="SEARCH SQUAD / CAPTAIN / REF ID"
              className="w-full bg-muted/20 border border-border rounded-2xl pl-14 pr-6 py-4 focus:border-primary outline-none font-mono text-sm tracking-widest transition-all focus:shadow-[0_0_30px_rgba(255,0,60,0.1)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
            <p className="text-muted-foreground font-mono uppercase tracking-[0.5em] text-xs">Synchronizing Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
            {filteredRegs.map((reg) => (
              <div key={reg.id} className="glass rounded-[2rem] border border-border/50 hover:border-primary/40 transition-all duration-500 flex flex-col group overflow-hidden bg-gradient-to-br from-card/80 to-transparent">
                {/* Header Section */}
                <div className="p-8 pb-4 border-b border-white/5 bg-white/5">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full border shadow-sm ${
                      reg.status === 'pending_payment' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' :
                      reg.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                      reg.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                      'bg-red-500/10 text-red-500 border-red-500/30'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        reg.status === 'pending_payment' ? 'bg-blue-500 animate-pulse' :
                        reg.status === 'pending' ? 'bg-yellow-500 animate-pulse' :
                        reg.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      {reg.status.replace('_', ' ')}
                    </div>
                    <time className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest opacity-60">
                      {new Date(reg.submittedAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </time>
                  </div>
                  <h3 className="text-3xl font-black font-mono tracking-tighter text-white mb-2 uppercase italic group-hover:text-primary transition-colors">{reg.teamName}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase tracking-widest">
                    <Users className="w-3 h-3 text-primary" />
                    Squad Entry
                  </div>
                </div>

                {/* Squad Grid */}
                <div className="p-8 pt-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[9px] text-muted-foreground uppercase font-mono tracking-widest">CAPTAIN</p>
                      <p className="font-bold text-sm text-white truncate">{reg.name}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[9px] text-muted-foreground uppercase font-mono tracking-widest">PAYER NAME</p>
                      <p className="font-bold text-sm text-primary truncate">{reg.payerName || "SAME AS CPT"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[9px] text-muted-foreground uppercase font-mono tracking-widest">WHATSAPP</p>
                      <a href={`https://wa.me/91${reg.phone}`} target="_blank" className="font-mono text-xs text-white/80 hover:underline flex items-center gap-1 font-bold">
                        <Phone className="w-3 h-3 text-primary" />
                        +91 {reg.phone}
                      </a>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-2xl p-4 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-2">
                      <span className="text-muted-foreground uppercase tracking-widest">Player UIDs</span>
                      <span className="text-primary italic">Verified Format</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-muted-foreground uppercase">Cpt ID</span>
                        <span className="text-[11px] font-mono text-white/90 truncate">{reg.gameUid}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] text-muted-foreground uppercase text-primary">P2 ID</span>
                        <span className="text-[11px] font-mono text-white/90 truncate">{reg.player2Uid}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] text-muted-foreground uppercase text-primary">P3 ID</span>
                        <span className="text-[11px] font-mono text-white/90 truncate">{reg.player3Uid}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] text-muted-foreground uppercase text-primary">P4 ID</span>
                        <span className="text-[11px] font-mono text-white/90 truncate">{reg.player4Uid}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-mono tracking-widest">UTR / UPI REF ID</p>
                    <p className="p-3 bg-primary/5 rounded-xl border border-primary/20 text-primary font-mono text-sm tracking-widest select-all">
                      {reg.utrId || "AWAITING PAYMENT"}
                    </p>
                  </div>
                  
                  {/* Photo Preview */}
                  {reg.screenshotUrl ? (
                    <div className="relative group aspect-video rounded-2xl overflow-hidden cursor-pointer bg-black/40 border border-white/5" onClick={() => setSelectedImg(reg.screenshotUrl!)}>
                      <img src={reg.screenshotUrl} alt="Transaction Proof" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                         <div className="bg-primary/20 backdrop-blur-md p-2 rounded-lg border border-primary/30">
                            <ImageIcon className="w-4 h-4 text-primary" />
                         </div>
                         <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">View Verification Proof</span>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-2xl bg-black/20 border border-dashed border-white/10 flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="w-8 h-8 text-muted-foreground opacity-20" />
                      <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">Photo TBD</p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 pt-0 flex gap-4 mt-auto">
                  <button
                    onClick={() => handleStatusUpdate(reg.id, "approved")}
                    disabled={reg.status === 'approved' || reg.status === 'pending_payment'}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-xs tracking-widest transition-all ${
                      (reg.status === 'approved' || reg.status === 'pending_payment') ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] border-b-4 border-green-800 active:border-b-0 active:translate-y-1'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    CONFIRM
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(reg.id, "rejected")}
                    disabled={reg.status === 'rejected' || reg.status === 'pending_payment'}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-xs tracking-widest transition-all ${
                      (reg.status === 'rejected' || reg.status === 'pending_payment') ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] border-b-4 border-red-900 active:border-b-0 active:translate-y-1'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    REJECT
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredRegs.length === 0 && !loading && (
          <div className="text-center py-40 glass border-2 border-dashed border-border/50 rounded-[3rem]">
            <Search className="w-20 h-20 text-muted-foreground mx-auto mb-8 opacity-20" />
            <p className="text-muted-foreground font-mono uppercase tracking-[0.5em] text-xs">Extraction yield zero results</p>
          </div>
        )}
      </div>

      {/* Modern Image Modal */}
      {selectedImg && (
        <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-xl flex items-center justify-center p-8 transition-all animate-in fade-in" onClick={() => setSelectedImg(null)}>
          <div className="relative max-w-5xl w-full max-h-[90vh] shadow-[0_0_100px_rgba(255,0,60,0.4)] rounded-3xl overflow-hidden border border-white/10 group">
            <img src={selectedImg} className="w-full h-full object-contain" alt="Verification Receipt High Res" />
            <button className="absolute top-6 right-6 p-4 bg-primary rounded-full text-white shadow-2xl hover:scale-110 active:scale-95 transition-all">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
