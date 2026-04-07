"use client"
import { db } from "../firebase.js";
import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc } from "firebase/firestore";

import { useState } from "react"
import { CheckCircle, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Script from "next/script"

interface FormData {
  game: string
  squadName: string
  captainId: string
  player2Id: string
  player3Id: string
  player4Id: string
  phoneNumber: string
}

interface FormErrors {
  game?: string
  squadName?: string
  captainId?: string
  player2Id?: string
  player3Id?: string
  player4Id?: string
  phoneNumber?: string
}

export function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    game: "bgmi",
    squadName: "",
    captainId: "",
    player2Id: "",
    player3Id: "",
    player4Id: "",
    phoneNumber: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.squadName.trim()) {
      newErrors.squadName = "Squad name is required"
    } else if (formData.squadName.length < 3) {
      newErrors.squadName = "Squad name must be at least 3 characters"
    }

    if (!formData.captainId.trim()) {
      newErrors.captainId = "Captain Game ID is required"
    }
    if (!formData.player2Id.trim()) {
      newErrors.player2Id = "Player 2 Game ID is required"
    }
    if (!formData.player3Id.trim()) {
      newErrors.player3Id = "Player 3 Game ID is required"
    }
    if (!formData.player4Id.trim()) {
      newErrors.player4Id = "Player 4 Game ID is required"
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const squad = formData.squadName.toLowerCase();

      // 🔍 1. SAME PHONE CHECK (UNIQUE SQUAD LEADER)
      const phoneRef = doc(db, "players", formData.phoneNumber);
      const phoneSnap = await getDoc(phoneRef);

      if (phoneSnap.exists()) {
        setSubmitError("⚠️ You already registered a squad with this number");
        setIsSubmitting(false);
        return;
      }

      // 🔍 2. SQUAD NAME UNIQUENESS CHECK
      const q = query(
        collection(db, "players"),
        where("squadName", "==", squad)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setSubmitError("❌ Squad name already taken. Please pick another name.");
        setIsSubmitting(false);
        return;
      }

      // ✅ 3. SAVE SQUAD DETAILS
      await setDoc(doc(db, "players", formData.phoneNumber), {
        game: formData.game,
        squadName: squad,
        captainId: formData.captainId,
        player2Id: formData.player2Id,
        player3Id: formData.player3Id,
        player4Id: formData.player4Id,
        phoneNumber: formData.phoneNumber,
        payment: "pending",
        createdAt: Date.now(),
      });

      // ✅ 4. SUCCESS SCREEN (PAYMENT BUTTON)
      setIsSuccess(true);

    } catch (error) {
      console.log(error);
      setSubmitError("Error aaya 😳");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    try {
      const res = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 100 }), // 1 INR in paise
      });
      const data = await res.json();

      if (data.error) {
        alert("Failed to initialize order.");
        return;
      }

      const options = {
        key: "rzp_test_SZu9r2VeGMvtxD",
        amount: "100",
        currency: "INR",
        name: "Distopia_X Esports",
        description: "Squad Registration Fee",
        order_id: data.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/verify-razorpay-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.valid) {
            // Update payment status in firebase
            const phoneRef = doc(db, "players", formData.phoneNumber);
            await updateDoc(phoneRef, {
              payment: "success"
            });
            alert("Payment Successful! Your squad is locked in.");
          } else {
            alert("Payment Verification Failed!");
          }
        },
        prefill: {
          name: formData.squadName,
          contact: formData.phoneNumber,
        },
        theme: {
          color: "#e11d48", // match the red-600
        },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Failed to initialize payment. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  if (isSuccess) {
    return (
      <section id="register" className="relative py-24 md:py-32 overflow-hidden noise-overlay">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="relative z-10 max-w-lg mx-auto px-4">
          <div className="glass rounded-2xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-mono text-2xl md:text-3xl font-bold mb-4">
              ALMOST DONE
            </h3>
            <p className="text-muted-foreground mb-8">
              Your {formData.game === "bgmi" ? "BGMI" : "Free Fire"} squad details have been saved. Pay the entry fee to secure your spot in Distopia_x.
            </p>
            <button
              onClick={handlePayment}
              className="w-full mt-2 mb-6 py-4 bg-green-600 hover:bg-green-700 transition-colors text-white font-bold rounded-lg text-center"
            >
              PAY ₹1 ENTRY FEE
            </button>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 border-t border-border/50 pt-6 mt-4">
              <button
                onClick={() => setIsSuccess(false)}
                className="text-primary font-mono tracking-wide hover:underline text-sm"
              >
                Register another squad
              </button>
              <Link
                href="/"
                className="text-muted-foreground font-mono tracking-wide hover:text-white transition-colors inline-flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Main Page
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="register" className="relative py-12 md:py-20 overflow-hidden noise-overlay">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      {/* Red glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-lg mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary font-mono tracking-[0.3em] text-sm uppercase mb-4">
            Join The Battle
          </p>
          <h2 className="font-mono text-3xl md:text-5xl font-bold tracking-wide">
            REGISTER YOUR SQUAD
          </h2>
          <p className="text-muted-foreground mt-2">
            Enter details for all 4 players to lock in your squad. Entry fee: ₹1
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 md:p-10 space-y-6 border border-red-600/60 shadow-[0_0_40px_rgba(220,38,38,0.5)] hover:shadow-[0_0_60px_rgba(220,38,38,0.7)] transition-shadow duration-500">
          {/* Game Selection */}
          <div>
            <label className="block text-sm font-mono tracking-wide text-muted-foreground mb-3">
              SELECT GAME
            </label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-background/50 border rounded-lg cursor-pointer transition-colors ${formData.game === 'bgmi' ? 'border-primary text-primary shadow-[0_0_10px_rgba(255,0,0,0.2)]' : 'border-border text-foreground hover:border-primary/50'}`}>
                <input type="radio" name="game" value="bgmi" checked={formData.game === 'bgmi'} onChange={handleChange} className="hidden" />
                <span className="font-bold tracking-wide">BGMI</span>
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-background/50 border rounded-lg cursor-pointer transition-colors ${formData.game === 'freefire' ? 'border-primary text-primary shadow-[0_0_10px_rgba(255,0,0,0.2)]' : 'border-border text-foreground hover:border-primary/50'}`}>
                <input type="radio" name="game" value="freefire" checked={formData.game === 'freefire'} onChange={handleChange} className="hidden" />
                <span className="font-bold tracking-wide">FREE FIRE</span>
              </label>
            </div>
          </div>

          {/* Squad Name */}
          <div>
            <label htmlFor="squadName" className="block text-sm font-mono tracking-wide text-muted-foreground mb-2">
              SQUAD NAME
            </label>
            <input
              type="text"
              id="squadName"
              name="squadName"
              value={formData.squadName}
              onChange={handleChange}
              placeholder="Enter your squad name"
              className={`w-full px-4 py-3 bg-background/50 border ${errors.squadName ? "border-destructive" : "border-border"
                } rounded-lg font-sans text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
            />
            {errors.squadName && (
              <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.squadName}
              </p>
            )}
          </div>

          {/* Captain Game ID */}
          <div>
            <label htmlFor="captainId" className="block text-sm font-mono tracking-wide text-muted-foreground mb-2">
              CAPTAIN GAME ID
            </label>
            <input
              type="text"
              id="captainId"
              name="captainId"
              value={formData.captainId}
              onChange={handleChange}
              placeholder={`Enter captain's ${formData.game === 'bgmi' ? 'BGMI' : 'Free Fire'} ID`}
              className={`w-full px-4 py-3 bg-background/50 border ${errors.captainId ? "border-destructive" : "border-border"
                } rounded-lg font-sans text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
            />
            {errors.captainId && (
              <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.captainId}
              </p>
            )}
          </div>

          {/* Player 2 Game ID */}
          <div>
            <label htmlFor="player2Id" className="block text-sm font-mono tracking-wide text-muted-foreground mb-2">
              PLAYER 2 GAME ID
            </label>
            <input
              type="text"
              id="player2Id"
              name="player2Id"
              value={formData.player2Id}
              onChange={handleChange}
              placeholder={`Enter Player 2 ${formData.game === 'bgmi' ? 'BGMI' : 'Free Fire'} ID`}
              className={`w-full px-4 py-3 bg-background/50 border ${errors.player2Id ? "border-destructive" : "border-border"
                } rounded-lg font-sans text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
            />
            {errors.player2Id && (
              <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.player2Id}
              </p>
            )}
          </div>

          {/* Player 3 Game ID */}
          <div>
            <label htmlFor="player3Id" className="block text-sm font-mono tracking-wide text-muted-foreground mb-2">
              PLAYER 3 GAME ID
            </label>
            <input
              type="text"
              id="player3Id"
              name="player3Id"
              value={formData.player3Id}
              onChange={handleChange}
              placeholder={`Enter Player 3 ${formData.game === 'bgmi' ? 'BGMI' : 'Free Fire'} ID`}
              className={`w-full px-4 py-3 bg-background/50 border ${errors.player3Id ? "border-destructive" : "border-border"
                } rounded-lg font-sans text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
            />
            {errors.player3Id && (
              <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.player3Id}
              </p>
            )}
          </div>

          {/* Player 4 Game ID */}
          <div>
            <label htmlFor="player4Id" className="block text-sm font-mono tracking-wide text-muted-foreground mb-2">
              PLAYER 4 GAME ID
            </label>
            <input
              type="text"
              id="player4Id"
              name="player4Id"
              value={formData.player4Id}
              onChange={handleChange}
              placeholder={`Enter Player 4 ${formData.game === 'bgmi' ? 'BGMI' : 'Free Fire'} ID`}
              className={`w-full px-4 py-3 bg-background/50 border ${errors.player4Id ? "border-destructive" : "border-border"
                } rounded-lg font-sans text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
            />
            {errors.player4Id && (
              <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.player4Id}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-mono tracking-wide text-muted-foreground mb-2">
              CAPTAIN WHATSAPP NUMBER
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              maxLength={10}
              className={`w-full px-4 py-3 bg-background/50 border ${errors.phoneNumber ? "border-destructive" : "border-border"
                } rounded-lg font-sans text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
            />
            {errors.phoneNumber && (
              <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {submitError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-300 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                REGISTERING SQUAD...
              </>
            ) : (
              "REGISTER FULL SQUAD"
            )}
          </button>

          <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By registering, you agree to follow all tournament rules and guidelines. You will be redirected to the payment page.
          </p>
        </form>
      </div>
    </section>
  )
}