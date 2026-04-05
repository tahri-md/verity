export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-destructive mb-4">403</h1>
        <h2 className="text-2xl font-bold text-foreground mb-4">Access Forbidden</h2>
        <p className="text-muted mb-8 max-w-sm">
          You don't have permission to access this resource. If you believe this is a mistake, please contact support.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </a>
          <a href="/" className="btn btn-secondary">
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}
