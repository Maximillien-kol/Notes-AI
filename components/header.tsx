import Link from "next/link"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onToggleMobileSidebar?: () => void
}

export function Header({ onToggleMobileSidebar }: HeaderProps = {}) {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground md:ml-0">
          <img src="/favicon.svg" alt="Notes AI" className="h-5 w-5" />
          <span className="hidden sm:inline">Notes AI</span>
          <span className="sm:hidden">Notes</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link href="/pricing" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Button variant="outline" size="sm" disabled className="text-xs sm:text-sm h-8 px-3">
            Sign In
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden h-8 w-8 ml-1"
            onClick={onToggleMobileSidebar}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </Button>
        </nav>
      </div>
    </header>
  )
}
