import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { AuthProvider } from '@/lib/auth-context';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'HireHub AI — Modern AI-Powered Job Board & Talent Matching Platform',
  description:
    'HireHub AI connects top software developers with industry-leading technology employers using AI job copilot, candidate match scoring, and automated interview question generation.',
  keywords: [
    'Job Board',
    'AI Hiring',
    'Next.js 15',
    'Developer Jobs',
    'Remote Software Engineer Jobs',
    'Recruiting AI',
    'React Jobs',
  ],
  authors: [{ name: 'HireHub AI Team' }],
  openGraph: {
    title: 'HireHub AI — Modern AI-Powered Job Board',
    description: 'Find your dream developer job or hire top tech talent with AI precision.',
    url: 'https://hirehub-ai.vercel.app',
    siteName: 'HireHub AI',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
