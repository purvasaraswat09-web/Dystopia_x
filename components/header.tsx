"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Trophy } from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const isRegisterPage = pathname === "/register"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-primary/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30 group-hover:border-primary transition-colors">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <span className="font-mono text-xl font-bold tracking-tighter text-white">
            DISTOPIA<span className="text-primary">_X</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-mono tracking-widest text-muted-foreground hover:text-white transition-colors">
            HOME
          </Link>
          <Link href="/#tournament" className="text-sm font-mono tracking-widest text-muted-foreground hover:text-white transition-colors">
            TOURNAMENT
          </Link>
          <Link href="/#rules" className="text-sm font-mono tracking-widest text-muted-foreground hover:text-white transition-colors">
            RULES
          </Link>
        </nav>

        <div>
          {isRegisterPage && (
            <Link
              href="/"
              className="relative inline-flex items-center justify-center px-6 py-2 text-sm font-bold font-mono tracking-widest border border-primary text-primary hover:bg-primary hover:text-white rounded-none overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)" }}
            >
              BACK HOME
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
