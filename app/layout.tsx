import type { Metadata, Viewport } from 'next'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { CLUB } from '@/lib/club-content'
import './globals.css'

const SITE_URL = 'https://www.awscloudclubsnmiet.org'
const TITLE = `${CLUB.name} · ${CLUB.collegeShort}`
const DESCRIPTION =
  'Official website of the AWS Student Builder Group at NMIET, Talegaon, Pune — hands-on AWS workshops, real cloud projects, certification prep and a student community, presented as a macOS-style Cloud OS.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s · ${CLUB.shortName}` },
  description: DESCRIPTION,
  applicationName: CLUB.shortName,
  keywords: ['AWS Student Builder Group', 'AWS SBG', 'NMIET', 'Nutan Maharashtra Institute of Engineering and Technology', 'Talegaon', 'Pune', 'AWS', 'cloud computing', 'student community', 'AWS workshops'],
  authors: [{ name: CLUB.shortName }],
  creator: CLUB.shortName,
  alternates: { canonical: '/' },
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/favicon.png', sizes: '64x64', type: 'image/png' }],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: CLUB.shortName },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    locale: 'en_IN',
    siteName: CLUB.shortName,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${CLUB.name} — ${CLUB.chapter}` }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og-image.png'] },
  robots: { index: true, follow: true },
}

/** Organization structured data for search engines. */
const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: `${CLUB.name} ${CLUB.collegeShort}`,
  alternateName: CLUB.shortName,
  url: SITE_URL,
  logo: `${SITE_URL}/icons/app-512.png`,
  email: CLUB.email,
  foundingDate: '2026-02-16',
  description: CLUB.tagline,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Talegaon Dabhade',
    addressRegion: 'Maharashtra',
    postalCode: '410507',
    addressCountry: 'IN',
  },
  parentOrganization: { '@type': 'CollegeOrUniversity', name: CLUB.college },
  sameAs: [CLUB.meetupUrl, CLUB.youtubeUrl],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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
                    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => {});
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }} />
        {/* Real content for crawlers and visitors without JavaScript */}
        <noscript>
          <main style={{ maxWidth: 640, margin: '48px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.6 }}>
            <h1>{CLUB.name} · {CLUB.chapter}</h1>
            <p>{CLUB.tagline}</p>
            <p>{CLUB.college}, {CLUB.city}. Founded {CLUB.founded}.</p>
            <ul>
              <li><a href={CLUB.meetupUrl}>Join us and RSVP to events on Meetup</a></li>
              <li><a href={CLUB.youtubeUrl}>YouTube</a></li>
              <li><a href={`mailto:${CLUB.email}`}>{CLUB.email}</a></li>
            </ul>
            <p>Turn on JavaScript to explore the full Cloud OS experience.</p>
          </main>
        </noscript>
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  )
}
