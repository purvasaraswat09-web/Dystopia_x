"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/firebase"
import { collection, doc, setDoc, getDoc, query, where, getDocs, onSnapshot } from "firebase/firestore"
import { ArrowLeft, CheckCircle, Loader2, AlertCircle, Copy, ExternalLink, Upload, Trophy, QrCode, Users } from "lucide-react"
import Link from "next/link"
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
  utrId: string
  payerName: string
  status: "pending_payment" | "pending" | "approved" | "rejected"
  screenshotUrl?: string
  submittedAt: number
}

export function RegistrationSystem() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("FORM")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    teamName: string
    phone: string
    gameUid: string
    player2Uid: string
    player3Uid: string
    player4Uid: string
    utrId: string
    payerName: string
    status?: string
  }>({
    name: "",
    teamName: "",
    phone: "",
    gameUid: "",
    player2Uid: "",
    player3Uid: "",
    player4Uid: "",
    utrId: "",
    payerName: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const UPI_ID = "krishsiingh444@oksbi"
  const AMOUNT = "200"
  const NAME = "Krish Singh"
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(NAME)}&am=${AMOUNT}&cu=INR`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`

  // Real-time listener — auto-updates when admin approves/rejects in Firebase
  useEffect(() => {
    const savedPhone = localStorage.getItem("temp_phone")
    if (!savedPhone) return

    setLoading(true)
    const docRef = doc(db, "registrations", savedPhone)

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      setLoading(false)
      if (docSnap.exists()) {
        const data = docSnap.data() as RegistrationData
        setFormData(prev => ({ ...prev, ...data }))

        if (data.status === "pending_payment") {
          setStep("PAYMENT")
        } else {
          setStatus(data.status)
          setStep("STATUS")
          // Show toast when admin approves
          if (data.status === "approved") {
            toast.success("🎉 Your payment is approved! Squad registered!")
          } else if (data.status === "rejected") {
            toast.error("Payment was rejected. Please try again.")
          }
        }
      } else {
        setLoading(false)
      }
    }, (error) => {
      console.error("Realtime listener error:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID)
    toast.success("UPI ID Copied!")
  }

  const handleRegisterAnother = () => {
    localStorage.removeItem("temp_phone")
    setFormData({
      name: "",
      teamName: "",
      phone: "",
      gameUid: "",
      player2Uid: "",
      player3Uid: "",
      player4Uid: "",
      utrId: "",
      payerName: "",
    })
    setStatus(null)
    setStep("FORM")
    toast.success("New registration started!")
  }

  const handleInitialRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!formData.teamName) newErrors.teamName = "Squad Name is required"
    if (!formData.name) newErrors.name = "Captain Name is required"
    
    if (!formData.phone) {
      newErrors.phone = "WhatsApp Number is required"
    } else if (formData.phone.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits"
    }

    const uidRegex = /^\d{9,11}$/
    if (!formData.gameUid) {
      newErrors.gameUid = "Captain Game ID is required"
    } else if (!uidRegex.test(formData.gameUid)) {
      newErrors.gameUid = "ID must be 9-11 digits"
    }

    if (!formData.player2Uid) {
      newErrors.player2Uid = "Player 2 ID is required"
    } else if (!uidRegex.test(formData.player2Uid)) {
      newErrors.player2Uid = "ID must be 9-11 digits"
    }

    if (!formData.player3Uid) {
      newErrors.player3Uid = "Player 3 ID is required"
    } else if (!uidRegex.test(formData.player3Uid)) {
      newErrors.player3Uid = "ID must be 9-11 digits"
    }

    if (!formData.player4Uid) {
      newErrors.player4Uid = "Player 4 ID is required"
    } else if (!uidRegex.test(formData.player4Uid)) {
      newErrors.player4Uid = "ID must be 9-11 digits"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error("Please fix the mistakes in the form")
      return
    }

    setErrors({})
    setLoading(true)
    try {
      // 1. Check if already registered
      const docRef = doc(db, "registrations", formData.phone)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data() as RegistrationData
        if (data.status !== "pending_payment") {
          localStorage.setItem("temp_phone", formData.phone)
          setStatus(data.status)
          setStep("STATUS")
          setLoading(false)
          return
        }
      }

      // 2. Save initial details
      const regData: Partial<RegistrationData> = {
        ...formData,
        status: "pending_payment",
        submittedAt: Date.now(),
      }

      await setDoc(docRef, regData)
      localStorage.setItem("temp_phone", formData.phone)
      setStep("PAYMENT")
      toast.success("Squad Details Saved! Proceed to Payment.")
    } catch (error) {
      console.error("Registration Error:", error)
      toast.error("Failed to save details. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.payerName) return toast.error("Payer Name is required")
    if (!formData.utrId) return toast.error("UTR ID is required")
    if (formData.utrId.length !== 12 || !/^\d{12}$/.test(formData.utrId)) return toast.error("UTR ID must be exactly 12 digits")

    setLoading(true)
    try {
      // Check if UTR ID is already used by another record
      const q = query(collection(db, "registrations"), where("utrId", "==", formData.utrId))
      const querySnapshot = await getDocs(q)
      
      const duplicate = querySnapshot.docs.find(doc => doc.id !== formData.phone)
      if (duplicate) {
        toast.error("This UTR ID has already been used!")
        setLoading(false)
        return
      }

      // Update the record
      const docRef = doc(db, "registrations", formData.phone)
      await setDoc(docRef, {
        ...formData,
        status: "pending",
        submittedAt: Date.now(),
      }, { merge: true })
      
      setStatus("pending")
      setStep("STATUS")
      toast.success("Payment submitted! Verification in progress.")
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
        <form onSubmit={handleInitialRegistration} className="glass rounded-2xl p-8 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
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
                className={`w-full bg-background/50 border rounded-xl px-4 py-3 outline-none transition-all placeholder:text-muted-foreground/30 ${errors.teamName ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-border focus:border-primary'}`}
                placeholder="Enter unique team name"
                value={formData.teamName}
                onChange={(e) => {
                  setFormData({ ...formData, teamName: e.target.value })
                  if (errors.teamName) setErrors({ ...errors, teamName: "" })
                }}
              />
              {errors.teamName && <p className="text-red-500 text-[10px] mt-1 font-mono uppercase tracking-wider animate-bounce">{errors.teamName}</p>}
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Captain Name</label>
                <input
                  required
                  className={`w-full bg-background/50 border rounded-xl px-4 py-3 outline-none transition-all ${errors.name ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-border focus:border-primary'}`}
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (errors.name) setErrors({ ...errors, name: "" })
                  }}
                />
                {errors.name && <p className="text-red-500 text-[10px] mt-1 font-mono uppercase tracking-wider">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Captain WhatsApp No.</label>
                <input
                  required
                  type="tel"
                  maxLength={10}
                  className={`w-full bg-background/50 border rounded-xl px-4 py-3 outline-none transition-all ${errors.phone ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-border focus:border-primary'}`}
                  placeholder="10-digit number"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })
                    if (errors.phone) setErrors({ ...errors, phone: "" })
                  }}
                />
                {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-mono uppercase tracking-wider">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Captain Game ID</label>
                <input
                  required
                  maxLength={11}
                  className={`w-full bg-background/50 border rounded-xl px-4 py-3 outline-none transition-all ${errors.gameUid ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-border focus:border-primary'}`}
                  placeholder="9-11 digit Game ID"
                  value={formData.gameUid}
                  onChange={(e) => {
                    setFormData({ ...formData, gameUid: e.target.value.replace(/\D/g, '') })
                    if (errors.gameUid) setErrors({ ...errors, gameUid: "" })
                  }}
                />
                {errors.gameUid && <p className="text-red-500 text-[10px] mt-1 font-mono uppercase tracking-wider">{errors.gameUid}</p>}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Player 2 Game ID</label>
                <input
                  required
                  maxLength={11}
                  className={`w-full bg-background/50 border rounded-xl px-4 py-3 outline-none transition-all text-primary/80 ${errors.player2Uid ? 'border-red-500' : 'border-border focus:border-primary'}`}
                  placeholder="9-11 digit Game ID"
                  value={formData.player2Uid}
                  onChange={(e) => {
                    setFormData({ ...formData, player2Uid: e.target.value.replace(/\D/g, '') })
                    if (errors.player2Uid) setErrors({ ...errors, player2Uid: "" })
                  }}
                />
                {errors.player2Uid && <p className="text-red-500 text-[10px] mt-1 font-mono uppercase tracking-wider">{errors.player2Uid}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Player 3 Game ID</label>
                <input
                  required
                  maxLength={11}
                  className={`w-full bg-background/50 border rounded-xl px-4 py-3 outline-none transition-all text-primary/80 ${errors.player3Uid ? 'border-red-500' : 'border-border focus:border-primary'}`}
                  placeholder="9-11 digit Game ID"
                  value={formData.player3Uid}
                  onChange={(e) => {
                    setFormData({ ...formData, player3Uid: e.target.value.replace(/\D/g, '') })
                    if (errors.player3Uid) setErrors({ ...errors, player3Uid: "" })
                  }}
                />
                {errors.player3Uid && <p className="text-red-500 text-[10px] mt-1 font-mono uppercase tracking-wider">{errors.player3Uid}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Player 4 Game ID</label>
                <input
                  required
                  maxLength={11}
                  className={`w-full bg-background/50 border rounded-xl px-4 py-3 outline-none transition-all text-primary/80 ${errors.player4Uid ? 'border-red-500' : 'border-border focus:border-primary'}`}
                  placeholder="9-11 digit Game ID"
                  value={formData.player4Uid}
                  onChange={(e) => {
                    setFormData({ ...formData, player4Uid: e.target.value.replace(/\D/g, '') })
                    if (errors.player4Uid) setErrors({ ...errors, player4Uid: "" })
                  }}
                />
                {errors.player4Uid && <p className="text-red-500 text-[10px] mt-1 font-mono uppercase tracking-wider">{errors.player4Uid}</p>}
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

          <div className="flex justify-start mt-4">
            <button type="button" onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-2 font-mono uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
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
              <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Payer Name</label>
              <input
                required
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-4 focus:border-primary outline-none transition-all"
                placeholder="Name of the person who paid"
                value={formData.payerName}
                onChange={(e) => setFormData({ ...formData, payerName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">UTR ID / UPI Ref No.</label>
              <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg shadow-inner">
                <p className="text-[10px] font-mono uppercase tracking-wider text-yellow-500 flex items-center justify-center gap-2 text-center leading-snug">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 animate-pulse" />
                  Please fill UTR ID carefully. The payment is verified by the UTR ID.
                </p>
              </div>
              <input
                required
                maxLength={12}
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-4 focus:border-primary outline-none transition-all font-mono text-center tracking-[0.2em]"
                placeholder="12-digit UTR number"
                value={formData.utrId}
                onChange={(e) => setFormData({ ...formData, utrId: e.target.value.replace(/\D/g, '') })}
              />
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
          {(status === "pending" || (!status && formData.status === "pending")) && (
            <>
              <div className="w-24 h-24 rounded-full bg-yellow-500/10 border-2 border-dashed border-yellow-500/50 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
              </div>
              <h2 className="text-4xl font-mono font-bold mb-2 italic uppercase text-white tracking-tighter">
                WAITING FOR APPROVAL ⏳
              </h2>
              <p className="text-yellow-400 font-mono text-xs uppercase tracking-widest mb-6 animate-pulse">
                Admin is verifying your transaction...
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 mb-6 max-w-sm mx-auto text-left">
                <p className="text-white text-sm leading-relaxed mb-1">
                  🎉 Squad <span className="text-yellow-400 font-bold uppercase">{formData.teamName}</span> — UTR submitted!
                </p>
                <p className="text-muted-foreground text-xs mb-6 font-mono uppercase tracking-tight">
                  Once admin verifies your payment, you will receive a WhatsApp confirmation.
                </p>
                
                <div className="pt-4 border-t border-yellow-500/10">
                  <p className="text-[10px] text-yellow-500/60 font-mono uppercase mb-3 leading-tight">
                    Note: Click only when you want to join any other squad
                  </p>
                  <button 
                    onClick={handleRegisterAnother}
                    className="w-full py-3 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 font-mono font-bold rounded-xl border border-yellow-500/30 transition-all flex items-center justify-center gap-2 group text-xs uppercase"
                  >
                    <Trophy className="w-4 h-4" />
                    Register Another Squad
                  </button>
                </div>
              </div>
            </>
          )}

          {(status === "approved" || (!status && formData.status === "approved")) && (
            <div className="space-y-6">
              <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.6)]">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              
              <h2 className="text-4xl font-mono font-bold mb-4 italic uppercase text-green-400 tracking-tighter">
                ✅ Transaction Successful
              </h2>
              
              <div className="space-y-2">
                <p className="text-white text-xl font-bold animate-pulse">Your transaction is done successfully!</p>
                <p className="text-muted-foreground">Your squad is now registered for the battle 🎮</p>
              </div>
              
              <div className="bg-background/50 border border-green-500/30 rounded-2xl p-6 my-8 space-y-4 max-w-sm mx-auto text-left">
                <div className="flex justify-between items-center border-b border-green-500/10 pb-3">
                  <p className="text-sm text-muted-foreground"><strong>Team Name:</strong></p>
                  <p className="text-sm font-bold text-white uppercase">{formData.teamName}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground"><strong>UTR Ref:</strong></p>
                  <p className="text-sm font-mono text-primary">{formData.utrId}</p>
                </div>
              </div>

              <div className="pt-4 mt-8 border-t border-green-500/20 text-left w-full max-w-sm mx-auto">
                <p className="text-[10px] text-green-500/60 font-mono uppercase mb-3 leading-tight">
                  Note: Click only when you want to join any other squad
                </p>
                <button 
                  onClick={handleRegisterAnother}
                  className="w-full py-5 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-[0_0_30px_rgba(255,0,60,0.5)] transition-all flex items-center justify-center gap-3 text-lg tracking-widest uppercase active:scale-95 border border-primary/50"
                >
                  <Trophy className="w-6 h-6" />
                  Register Another Squad
                </button>
              </div>
            </div>
          )}

          {(status === "rejected" || (!status && formData.status === "rejected")) && (
            <>
              <div className="w-24 h-24 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center mx-auto mb-8">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-4xl font-mono font-bold mb-4 italic uppercase text-red-500 tracking-tighter">FAILED ❌</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed max-w-sm mx-auto">
                Transaction proof was invalid or rejected. Please check your data and try again.
              </p>
              <button
                onClick={handleRegisterAnother}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl"
              >
                RE-REGISTER SQUAD
              </button>
            </>
          )}

          <div className="p-6 bg-muted/20 rounded-2xl border border-border inline-block w-full mt-6">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-4">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">Team Name</span>
              <span className="text-sm font-bold text-white uppercase">{formData.teamName || "SQUAD"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">UTR Ref</span>
              <span className="text-sm font-mono text-primary select-all">{formData.utrId || "---"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
