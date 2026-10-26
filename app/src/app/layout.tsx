import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'Voiz — Many Voices. One Clear Plan',
  description: 'AI-Powered Community Needs & Opportunity Mapper. Transform scattered complaints and feedback into an evidence-backed, ranked action plan.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#e6e0f0] text-[#211B38] min-h-screen antialiased selection:bg-[#FF4FA3] selection:text-white">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
