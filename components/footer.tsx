"use client"

import { Instagram, Youtube } from "lucide-react"

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/dystopia___x/#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
]

export function Footer() {
  return (
    <footer className="relative py-12 md:py-16 overflow-hidden noise-overlay">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-card/50 to-background" />

      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <h3 className="font-mono text-xl md:text-2xl font-bold tracking-wider mb-6">
            DISTOPIA<span className="text-primary">_X</span>
          </h3>

          {/* Social Links */}
          <div className="flex items-center gap-4 mb-8">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-card/50 border border-border hover:border-primary hover:bg-primary/10 transition-all duration-300 group"
              >
                <social.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>

          {/* Organizer */}
          <p className="text-muted-foreground text-sm">
            Organized by <span className="text-foreground font-medium">Distopia_x</span>
          </p>

          {/* Developers */}
          <p className="text-muted-foreground text-xs mt-2 mb-6 tracking-wide uppercase font-mono">
           Website developed by <span className="text-primary font-bold">Krish Singh, Vedant Varshney and Purva Saraswat</span>
          </p>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
            <a href="#details" className="hover:text-primary transition-colors">
              Details
            </a>
            <a href="/register" className="hover:text-primary transition-colors">
              Register
            </a>
            <a href="#rules" className="hover:text-primary transition-colors">
              Rules
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} Distopia_x. All rights reserved. Not affiliated with Krafton or BGMI.
          </p>
        </div>
      </div>
    </footer>
  )
}
