import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SignalNG: Hyper-Local Crisis Triage Engine',
  description:
    'Organizing community chatter, measuring source depth, cross-examining contradictions, and alerting residents within a verified 5 km radius.',
  icons: {
    icon: '/signal.png',
    shortcut: '/signal.png',
    apple: '/signal.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FAFAF9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFAF9] text-[#0A0A0A] selection:bg-[#C7862B]/20 selection:text-[#0A0A0A]">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#0A0A0A',
              border: '1px solid #E7E5E4',
              borderRadius: '8px',
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '12px',
            },
          }}
        />
      </body>
    </html>
  );
}
