import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AmplifyProvider } from '@/lib/amplify-provider'
import { NotificationsProvider } from '@/lib/notifications-context'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AWS Student Builder Group NMIET | Cloud OS',
  description: 'Official website of AWS Student Builder Group NMIET — empowering the next generation of cloud innovators through hands-on learning, real-world projects & community.',
  keywords: ['AWS', 'Student Builder Group', 'Student Builder Groups', 'NMIET', 'Cloud Computing', 'DevOps', 'Serverless', 'Student Community'],
  authors: [{ name: 'AWS Student Builder Group NMIET' }],
  creator: 'AWS Student Builder Group NMIET',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-icon.png',
    shortcut: '/favicon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cloud OS',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: 'AWS Student Builder Group NMIET | Cloud OS',
    description: 'Official AWS Student Builder Group NMIET — Cloud OS. Build, learn and connect with the cloud.',
    siteName: 'AWS Student Builder Group NMIET',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#000000ff' },
    { media: '(prefers-color-scheme: dark)', color: '#4B2FA8' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA service worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    navigator.serviceWorker.getRegistrations().then((registrations) => {
                      for (const reg of registrations) {
                        reg.unregister().then((active) => {
                          if (active) {
                            console.log('Stale local Service Worker unregistered successfully.');
                            window.location.reload();
                          }
                        });
                      }
                    });
                  } else {
                    navigator.serviceWorker.register('/sw.js').catch(() => {});
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <AmplifyProvider>
          <NotificationsProvider>
            {children}
            <PWAInstallPrompt />
          </NotificationsProvider>
        </AmplifyProvider>
        <Analytics />
      </body>
    </html>
  )
}
