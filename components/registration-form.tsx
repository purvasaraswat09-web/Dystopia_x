"use client"

import { db, storage } from "@/firebase"
import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

import { useState } from "react"
import { CheckCircle, Loader2, AlertCircle, ArrowLeft, Camera, Upload } from "lucide-react"
import Link from "next/link"

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
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false)
  const [screenshotUploaded, setScreenshotUploaded] = useState(false)

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
        const playerData = phoneSnap.data();
        if (playerData.payment === "success") {
          setSubmitError("⚠️ You already registered a squad with this number");
          setIsSubmitting(false);
          return;
        } else {
          // If pending or submitted, just show the payment screen again
          setFormData({
            game: playerData.game,
            squadName: playerData.squadName,
            captainId: playerData.captainId,
            player2Id: playerData.player2Id,
            player3Id: playerData.player3Id,
            player4Id: playerData.player4Id,
            phoneNumber: playerData.phoneNumber,
          });
          setIsSuccess(true);
          setIsSubmitting(false);
          return;
        }
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

  const handleScreenshotUpload = async () => {
    if (!screenshot) {
      alert("Please select a screenshot first.");
      return;
    }

    setUploadingScreenshot(true);
    try {
      const storageRef = ref(storage, `screenshots/${formData.phoneNumber}_${Date.now()}`);
      await uploadBytes(storageRef, screenshot);
      const downloadURL = await getDownloadURL(storageRef);

      const phoneRef = doc(db, "players", formData.phoneNumber);
      await updateDoc(phoneRef, {
        payment: "submitted",
        screenshotUrl: downloadURL,
      });

      setScreenshotUploaded(true);
      alert("Screenshot submitted successfully! We will verify your payment soon.");
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to upload screenshot. Please try again.");
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
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
    const upiUrl = `upi://pay?pa=krishsiingh444@pingpay&pn=Krish%20Singh&cu=INR&am=199`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

    return (
      <section id="register" className="relative py-24 md:py-32 overflow-hidden noise-overlay">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="relative z-10 max-w-lg mx-auto px-4">
          <div className="glass rounded-2xl p-8 md:p-12 text-center border border-primary/30">
            {!screenshotUploaded ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-mono text-2xl md:text-3xl font-bold mb-4">
                  PAYMENT REQUIRED
                </h3>
                <p className="text-muted-foreground mb-8 text-sm">
                  Scan the QR code below to pay <span className="text-primary font-bold">₹199 Entry Fee</span>. After payment, upload the screenshot to verify your registration.
                </p>

                <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 md:w-56 md:h-56" />
                </div>

                <div className="mb-8 p-4 bg-background/50 rounded-lg border border-border">
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">UPI DETAILS</p>
                  <p className="text-foreground font-bold">Krish Singh</p>
                  <p className="text-primary font-mono text-sm uppercase tracking-tighter">krishsiingh444@pingpay</p>
                </div>

                <div className="space-y-4">
                  <label className="block w-full cursor-pointer group">
                    <div className="flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-border group-hover:border-primary transition-colors rounded-xl bg-background/30">
                      <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                      <p className="text-sm text-muted-foreground group-hover:text-foreground">
                        {screenshot ? screenshot.name : "Select Payment Screenshot"}
                      </p>
                      <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                  </label>

                  <button
                    onClick={handleScreenshotUpload}
                    disabled={uploadingScreenshot || !screenshot}
                    className={`w-full py-4 bg-primary hover:bg-primary/90 transition-all text-white font-bold rounded-xl flex items-center justify-center gap-2 ${uploadingScreenshot || !screenshot ? 'opacity-50 cursor-not-allowed' : 'shadow-[0_0_20px_rgba(255,0,0,0.3)]'}`}
                  >
                    {uploadingScreenshot ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        UPLOADING...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        SUBMIT VERIFICATION
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="font-mono text-2xl md:text-3xl font-bold mb-4 text-green-500">
                  SUBMITTED!
                </h3>
                <p className="text-muted-foreground mb-8">
                  Your payment proof has been received. Our team will verify it within 24 hours. Your squad is now in the queue.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center w-full py-4 bg-background border border-border hover:border-primary transition-all text-foreground font-bold rounded-xl gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Return Home
                </Link>
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 border-t border-border/50 pt-8 mt-8">
              {!screenshotUploaded && (
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-muted-foreground font-mono tracking-wide hover:text-white transition-colors text-xs"
                >
                  Change registration info
                </button>
              )}
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
            Enter details for all 4 players to lock in your squad. Entry fee: ₹199
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