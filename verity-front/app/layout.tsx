import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Verity - Blockchain Verification",
  description: "A comprehensive blockchain verification system with digital signatures, merkle proofs, and audit trails.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
