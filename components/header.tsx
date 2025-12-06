import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <img src="/favicon.svg" alt="Notes AI" className="h-5 w-5" />
          <span>Notes AI</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Button variant="outline" size="sm" disabled>
            Sign In
          </Button>
        </nav>
      </div>
    </header>
  )
}
