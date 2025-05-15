
import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a common, clean font
import './globals.css';
import { cn } from "@/lib/utils";
// Toaster can be here or in a more specific layout like (app)/layout.tsx
// For this app, (app)/layout.tsx handles Toaster for authenticated routes.

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Guardian Angel App',
  description: 'Mental Health & Wellbeing Tracker for Kids',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        {children}
      </body>
    </html>
  );
}
