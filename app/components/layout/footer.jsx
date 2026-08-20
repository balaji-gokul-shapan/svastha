export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-4 py-6 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} Svastha School Management. All rights reserved.</p>
        <nav className="flex items-center gap-4">
          <a href="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </a>
          <a href="/terms" className="transition-colors hover:text-foreground">
            Terms
          </a>
          <a href="/support" className="transition-colors hover:text-foreground">
            Support
          </a>
        </nav>
      </div>
    </footer>
  );
}