import type { Metadata, Viewport } from 'next'
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
  title: 'AWS SBG NMIET | Cloud OS',
  description: 'Official website of AWS SBG NMIET — empowering the next generation of cloud innovators through hands-on learning, real-world projects & community.',
  keywords: ['AWS', 'AWS SBG', 'NMIET', 'Student Builder Group', 'Cloud Computing', 'DevOps', 'Serverless', 'Student Community'],
  authors: [{ name: 'AWS SBG NMIET' }],
  creator: 'AWS SBG NMIET',
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
    title: 'AWS SBG NMIET | Cloud OS',
    description: 'Official AWS SBG NMIET — Cloud OS. Build, learn and connect with the cloud.',
    siteName: 'AWS SBG NMIET',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#1d1d1f' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Dark mode priority init & PWA service worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (localStorage.getItem('aws-os:appearance') === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
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
      </body>
    </html>
  )
}
