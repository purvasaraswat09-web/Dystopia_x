import { HeroSection } from "@/components/hero-section"
import { VibeSection } from "@/components/vibe-section"
import { TournamentDetails } from "@/components/tournament-details"
import { RulebookSection } from "@/components/rulebook-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <HeroSection />
      <VibeSection />
      <TournamentDetails />
      <RulebookSection />
      <Footer />
    </main>
  )
}
