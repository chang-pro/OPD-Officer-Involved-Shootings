import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orlando Officer-Involved Shootings',
  description: 'Interactive map of officer-involved shooting incidents in Orlando',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body>
        <main className="min-h-screen bg-black">
          {children}
        </main>
      </body>
    </html>
  );
}