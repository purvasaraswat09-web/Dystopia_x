"use client"

import { useState, useEffect } from "react"
import { db, storage } from "@/firebase"
import { collection, doc, setDoc, getDoc, query, where, getDocs } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { CheckCircle, Loader2, AlertCircle, Copy, ExternalLink, Camera, Upload, Trophy, QrCode, Users } from "lucide-react"
import { toast } from "sonner"

type Step = "FORM" | "PAYMENT" | "STATUS"

interface RegistrationData {
  name: string
  teamName: string
  phone: string
  gameUid: string
  player2Uid: string
  player3Uid: string
  player4Uid: string
  transactionId: string
  status: "pending" | "approved" | "rejected"
  screenshotUrl: string
  submittedAt: number
}

export function RegistrationSystem() {
  const [step, setStep] = useState<Step>("FORM")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | null>(null)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    teamName: "",
    phone: "",
    gameUid: "",
    player2Uid: "",
    player3Uid: "",
    player4Uid: "",
    transactionId: "",
  })

  const UPI_ID = "krishsiingh444@oksbi"
  const AMOUNT = "50"
  const NAME = "Krish Singh"
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(NAME)}&am=${AMOUNT}&cu=INR`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`

  // Check existing registration on load
  useEffect(() => {
    const checkStatus = async () => {
      const savedTransId = localStorage.getItem("temp_transaction_id")

      if (savedTransId) {
        setLoading(true)
        try {
          const q = query(collection(db, "registrations"), where("transactionId", "==", savedTransId))
          const querySnapshot = await getDocs(q)
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data() as RegistrationData
            setStatus(data.status)
            setStep("STATUS")
          }
        } catch (error) {
          console.error("Error fetching status:", error)
        } finally {
          setLoading(false)
        }
      }
    }
    checkStatus()
  }, [])

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID)
    toast.success("UPI ID Copied!")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0])
    }
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.teamName || !formData.gameUid || !formData.phone) {
      toast.error("Please fill all mandatory details")
      return
    }
    if (formData.phone.length !== 10) {
      toast.error("Phone number must be 10 digits")
      return
    }
    setStep("PAYMENT")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!screenshot) return toast.error("Please upload payment screenshot")
    if (!formData.transactionId) return toast.error("Transaction ID is required")

    setLoading(true)
    try {
      const q = query(collection(db, "registrations"), where("transactionId", "==", formData.transactionId))
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        toast.error("This Transaction ID has already been used!")
        setLoading(false)
        return
      }

      const storageRef = ref(storage, `screenshots/${formData.transactionId}_${Date.now()}`)
      await uploadBytes(storageRef, screenshot)
      const downloadURL = await getDownloadURL(storageRef)

      const regData: RegistrationData = {
        ...formData,
        screenshotUrl: downloadURL,
        status: "pending",
        submittedAt: Date.now(),
      }

      await setDoc(doc(db, "registrations", formData.transactionId), regData)
      
      localStorage.setItem("temp_transaction_id", formData.transactionId)
      setStatus("pending")
      setStep("STATUS")
      toast.success("Registration submitted successfully!")
    } catch (error) {
      console.error("Submission Error:", error)
      toast.error("Failed to submit. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading && step !== "STATUS") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Processing your request...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Steps Indicator */}
      <div className="flex justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted/30 -translate-y-1/2 z-0" />
        {[
          { label: "Squad Details", s: "FORM" },
          { label: "Secure Payment", s: "PAYMENT" },
          { label: "Join Battle", s: "STATUS" },
        ].map((item, i) => (
          <div
            key={item.label}
            className={`relative z-10 flex flex-col items-center gap-2 ${
              (step === item.s || (step === "PAYMENT" && i === 0) || (step === "STATUS")) ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-500 ${
              (step === item.s || (step === "PAYMENT" && i === 0) || (step === "STATUS")) ? "bg-background border-primary scale-110 shadow-[0_0_15px_rgba(255,0,60,0.3)]" : "bg-muted border-muted"
            }`}>
              {i + 1}
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">{item.label}</span>
          </div>
        ))}
      </div>

      {step === "FORM" && (
        <form onSubmit={handleNextStep} className="glass rounded-2xl p-8 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="text-center mb-8">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-mono font-bold mb-2 uppercase italic text-white drop-shadow-[0_0_8px_rgba(255,0,60,0.5)]">SQUAD REGISTRATION</h2>
            <p className="text-muted-foreground text-xs uppercase tracking-widest font-mono">Step 1: Fill all player details</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Squad Name (Team Name)</label>
              <input
                required
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
                placeholder="Enter unique team name"
                value={formData.teamName}
                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              />
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Captain Name</label>
                <input
                  required
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Captain WhatsApp No.</label>
                <input
                  required
                  type="tel"
                  maxLength={10}
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                  placeholder="10-digit number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Captain Game UID</label>
                <input
                  required
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                  placeholder="Captain ID"
                  value={formData.gameUid}
                  onChange={(e) => setFormData({ ...formData, gameUid: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Player 2 Game UID</label>
                <input
                  required
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all text-primary/80"
                  placeholder="P2 UID"
                  value={formData.player2Uid}
                  onChange={(e) => setFormData({ ...formData, player2Uid: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Player 3 Game UID</label>
                <input
                  required
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all text-primary/80"
                  placeholder="P3 UID"
                  value={formData.player3Uid}
                  onChange={(e) => setFormData({ ...formData, player3Uid: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Player 4 Game UID</label>
                <input
                  required
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all text-primary/80"
                  placeholder="P4 UID"
                  value={formData.player4Uid}
                  onChange={(e) => setFormData({ ...formData, player4Uid: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(255,0,60,0.4)] transition-all flex items-center justify-center gap-3 group mt-8 border border-primary/50"
          >
            NEXT: PROCEED TO PAYMENT
            <CheckCircle className="w-5 h-5 group-hover:scale-125 transition-transform" />
          </button>
        </form>
      )}

      {step === "PAYMENT" && (
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-mono font-bold mb-2 uppercase italic text-white drop-shadow-[0_0_8px_rgba(255,0,60,0.5)]">Step 2: Payment</h2>
            <p className="text-muted-foreground text-xs uppercase tracking-widest font-mono">Secure your entry via UPI</p>
          </div>

          <div className="bg-background/50 rounded-xl p-6 border border-border mb-8 flex flex-col items-center">
            <p className="text-5xl font-mono font-bold text-primary mb-2">₹{AMOUNT}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mb-6">ENTRY FEE PER SQUAD</p>
            
            <div className="bg-white p-3 rounded-lg mb-6 shadow-[0_0_30px_rgba(255,255,255,0.2)] group relative">
              <img src={qrCodeUrl} alt="UPI QR" className="w-48 h-48" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <QrCode className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>

            <div className="w-full space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">UPI ID</p>
                  <p className="font-mono text-sm select-all">{UPI_ID}</p>
                </div>
                <button type="button" onClick={copyUpiId} className="p-2 hover:bg-primary/20 rounded-md transition-colors text-primary">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <a
                href={upiUrl}
                className="flex items-center justify-center gap-2 w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(255,0,60,0.4)] transition-all active:scale-95"
              >
                <ExternalLink className="w-5 h-5" />
                PAY NOW (OPEN UPI APPS)
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Transaction ID (UPI Ref No.)</label>
              <input
                required
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-4 focus:border-primary outline-none transition-all font-mono text-center tracking-[0.2em]"
                placeholder="Enter 12-digit number"
                value={formData.transactionId}
                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">Upload Payment Proof (Screenshot)</label>
              <label className="block cursor-pointer group">
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border group-hover:border-primary/50 transition-all rounded-xl bg-background/30">
                  {screenshot ? (
                    <div className="flex items-center gap-3 text-primary animate-in zoom-in">
                      <CheckCircle className="w-8 h-8" />
                      <span className="text-sm font-bold truncate max-w-[200px]">{screenshot.name}</span>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-10 h-10 text-muted-foreground mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-sm text-muted-foreground">CLICK TO SELECT PHOTO</p>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 group border-b-4 border-green-800 active:border-b-0 active:translate-y-1"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6 group-hover:-translate-y-2 transition-transform" />}
              FINAL SUBMISSION
            </button>

            <button
              type="button"
              onClick={() => setStep("FORM")}
              className="w-full py-2 text-xs text-muted-foreground hover:text-white transition-colors uppercase tracking-[0.3em] font-mono"
            >
              ← Edit Squad Details
            </button>
          </div>
        </form>
      )}

      {step === "STATUS" && (
        <div className="glass rounded-2xl p-12 border border-primary/20 text-center animate-in zoom-in duration-500">
          {status === "pending" && (
            <>
              <div className="w-24 h-24 rounded-full bg-yellow-500/10 border-2 border-dashed border-yellow-500/50 flex items-center justify-center mx-auto mb-8 animate-spin-slow">
                <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
              </div>
              <h2 className="text-4xl font-mono font-bold mb-4 italic uppercase text-white tracking-tighter">WAITING FOR APPROVAL</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed max-w-sm mx-auto">
                Your squad registration is in the queue. Verification typically takes <span className="text-white font-bold">15-60 minutes</span>.
              </p>
            </>
          )}

          {status === "approved" && (
            <>
              <div className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-4xl font-mono font-bold mb-4 italic uppercase text-green-500 tracking-tighter">SQUAD REGISTERED ✅</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed max-w-sm mx-auto">
                Victory awaits! Your team is officially in the tournament. Instructions have been sent to your game account.
              </p>
            </>
          )}

          {status === "rejected" && (
            <>
              <div className="w-24 h-24 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center mx-auto mb-8">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-4xl font-mono font-bold mb-4 italic uppercase text-red-500 tracking-tighter">FAILED ❌</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed max-w-sm mx-auto">
                Transaction proof was invalid or rejected. Please check your data and try again.
              </p>
              <button
                onClick={() => setStep("FORM")}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl"
              >
                RE-REGISTER SQUAD
              </button>
            </>
          )}

          <div className="p-6 bg-muted/20 rounded-2xl border border-border inline-block w-full">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-4">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">Team Name</span>
              <span className="text-sm font-bold text-white uppercase">{formData.teamName || "SQUAD"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">Transaction Ref</span>
              <span className="text-sm font-mono text-primary select-all">{localStorage.getItem("temp_transaction_id") || "---"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
