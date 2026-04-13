import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
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
  title: 'AWS Cloud Club NMIET | Cloud OS',
  description: 'Official website of AWS Cloud Club NMIET — empowering the next generation of cloud innovators through hands-on learning, real-world projects & community.',
  keywords: ['AWS', 'Cloud Club', 'NMIET', 'Cloud Computing', 'DevOps', 'Serverless', 'Student Community'],
  authors: [{ name: 'AWS Cloud Club NMIET' }],
  creator: 'AWS Cloud Club NMIET',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-icon.png',
    shortcut: '/favicon.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6B4FE8' },
    { media: '(prefers-color-scheme: dark)',  color: '#4B2FA8' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cloud OS',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: 'AWS Cloud Club NMIET | Cloud OS',
    description: 'Official AWS Cloud Club NMIET — Cloud OS. Build, learn and connect with the cloud.',
    siteName: 'AWS Cloud Club NMIET',
  },
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
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
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
      </body>
    </html>
  )
}
