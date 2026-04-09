"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const rules = [
  {
    id: "rule-1",
    title: "No Emulators Allowed",
    content:
      "All participants must play on mobile devices only. Any player found using emulators, keyboard/mouse, or controller peripherals will be immediately disqualified along with their entire squad.",
  },
  {
    id: "rule-2",
    title: "No Hacks or Cheats",
    content:
      "Use of any third-party software, hacks, aimbots, wallhacks, or any form of cheating is strictly prohibited. Anti-cheat systems will be monitored throughout the tournament. Violators will face permanent bans from future events.",
  },
  {
    id: "rule-3",
    title: "Fair Play Policy",
    content:
      "All players must follow fair play guidelines. Teaming with opposing squads, stream sniping, exploiting bugs, or any unsportsmanlike conduct will result in disqualification.",
  },
  {
    id: "rule-4",
    title: "Squad Requirements",
    content:
      "Each squad must consist of exactly 4 players. All players must be currently enrolled in a recognized college/university. College ID verification may be required before finals.",
  },
  {
    id: "rule-5",
    title: "Match Connectivity",
    content:
      "Players are responsible for their own internet connectivity. If a player disconnects, the match will continue. No rematches will be granted due to network issues.",
  },
  {
    id: "rule-6",
    title: "Point System",
    content:
      "Points will be awarded based on placement and eliminations. Chicken Dinner: 15 points, Top 5: 10 points, Top 10: 5 points. Each elimination: 1 point. Final standings determined by total points across all matches.",
  },
  {
    id: "rule-7",
    title: "Communication",
    content:
      "All official communications will be through our Discord server. Joining the Discord is mandatory for participating squads. Match schedules and room IDs will be shared 30 minutes before each match.",
  },
  {
    id: "rule-8",
    title: "No Respawning",
    content:
      "Respawning is strictly NOT allowed in any tournament matches. Once eliminated, a player stays eliminated. Any exploitation of event-specific respawn features will result in immediate disqualification.",
  },
]

export function RulebookSection() {
  return (
    <section id="rules" className="relative py-24 md:py-32 overflow-hidden noise-overlay">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />

      <div className="relative z-10 max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary font-mono tracking-[0.3em] text-sm uppercase mb-4">
            Know The Rules
          </p>
          <h2 className="font-mono text-3xl md:text-5xl font-bold tracking-wide">
            TOURNAMENT RULEBOOK
          </h2>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8">
          <Accordion type="single" collapsible className="space-y-2">
            {rules.map((rule, index) => (
              <AccordionItem
                key={rule.id}
                value={rule.id}
                className="border-border/50 data-[state=open]:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="hover:no-underline py-5 text-left">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-primary text-sm w-6">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-sans text-base md:text-lg font-medium">
                      {rule.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pl-10 pr-4 pb-5 leading-relaxed">
                  {rule.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Tournament organizers reserve the right to modify rules. Final decisions rest with the admin panel.
        </p>
      </div>
    </section>
  )
}
