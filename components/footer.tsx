export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-6 relative z-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <img src="/favicon.svg" alt="Notes AI" className="h-4 w-4" />
            <span>Notes AI</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Transform messy notes into clarity</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Built for you</span>
            <span>·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
