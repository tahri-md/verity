export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-4">Page Not Found</h2>
        <p className="text-muted mb-8 max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/dashboard" className="btn btn-primary">
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}
