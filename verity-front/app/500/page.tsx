export default function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-destructive mb-4">500</h1>
        <h2 className="text-2xl font-bold text-foreground mb-4">Server Error</h2>
        <p className="text-muted mb-8 max-w-sm">
          Something went wrong on our end. Please try refreshing the page or contact support if the problem persists.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Refresh Page
          </button>
          <a href="/dashboard" className="btn btn-secondary">
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
