"use client"

import { useState, useEffect } from "react"
import { db } from "@/firebase"
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { CheckCircle, XCircle, Eye, Loader2, ShieldCheck, Search, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface RegistrationData {
  id: string
  name: string
  teamName: string
  gameUid: string
  transactionId: string
  status: "pending" | "approved" | "rejected"
  screenshotUrl: string
  submittedAt: number
}

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([])
  const [loading, setLoading] = useState(true)
  const [passcode, setPasscode] = useState("")
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedImg, setSelectedImg] = useState<string | null>(null)

  const ADMIN_PASSCODE = "112233" // Simple passcode for demo, can be changed

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
      toast.success("Welcome back, Admin!")
    } else {
      toast.error("Invalid passcode")
    }
  }

  const handleStatusUpdate = async (id: string, status: "approved" | "rejected") => {
    try {
      const regRef = doc(db, "registrations", id)
      await updateDoc(regRef, { status })
      toast.success(`Registration ${status}!`)
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Failed to update status")
    }
  }

  const filteredRegs = registrations.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.transactionId.includes(searchTerm)
  )

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form onSubmit={handleAuth} className="glass p-8 rounded-2xl border border-primary/30 max-w-sm w-full text-center">
          <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-2xl font-mono font-bold mb-6 uppercase tracking-widest italic">Admin Access</h1>
          <input
            type="password"
            placeholder="Enter security token"
            className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 mb-6 focus:border-primary outline-none text-center font-mono tracking-[0.5em]"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
          />
          <button className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all">
            AUTHORIZE
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-mono font-bold italic uppercase tracking-tighter flex items-center gap-3">
              <span className="text-primary">Admin</span> Panel
              <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full not-italic tracking-widest border border-primary/20">LIVE CONTROL</span>
            </h1>
            <p className="text-muted-foreground mt-2 font-mono text-sm uppercase tracking-widest">Verify payments and manage registrations</p>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Name / Team / Trans ID"
              className="w-full bg-muted/30 border border-border rounded-xl pl-12 pr-4 py-3 focus:border-primary outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground font-mono">LOADING REGISTRATIONS...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRegs.map((reg) => (
              <div key={reg.id} className="glass rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-border/50">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${
                      reg.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      reg.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {reg.status}
                    </span>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {new Date(reg.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <h3 className="text-xl font-bold font-mono tracking-tight text-white mb-1 uppercase truncate">{reg.teamName}</h3>
                  <p className="text-sm text-primary font-mono tracking-tighter">Captain: {reg.name}</p>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4 flex-grow">
                  <div className="space-y-2">
                    <p className="text-[10px] text-muted-foreground uppercase font-mono">Game ID</p>
                    <p className="font-mono text-sm bg-muted/20 p-2 rounded-lg border border-border">{reg.gameUid}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-muted-foreground uppercase font-mono">Transaction ID (Ref)</p>
                    <p className="font-mono text-sm bg-muted/20 p-2 rounded-lg border border-border select-all">{reg.transactionId}</p>
                  </div>
                  
                  <div className="relative group aspect-video rounded-xl overflow-hidden cursor-pointer bg-background/50 border border-border" onClick={() => setSelectedImg(reg.screenshotUrl)}>
                    <img src={reg.screenshotUrl} alt="Payment" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-primary p-3 rounded-full shadow-xl">
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 flex gap-3 mt-auto">
                  <button
                    onClick={() => handleStatusUpdate(reg.id, "approved")}
                    disabled={reg.status === 'approved'}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                      reg.status === 'approved' ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    APPROVE
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(reg.id, "rejected")}
                    disabled={reg.status === 'rejected'}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                      reg.status === 'rejected' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
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
          <div className="text-center py-32 glass border-dashed border-2 border-border rounded-3xl">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
            <p className="text-muted-foreground font-mono uppercase tracking-widest">No registrations found matching your query</p>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImg && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedImg(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <img src={selectedImg} className="w-full h-full object-contain rounded-xl" alt="Zoomed screenshot" />
            <button className="absolute -top-4 -right-4 p-3 bg-primary rounded-full text-white shadow-2xl hover:scale-110 transition-transform">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
