import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster as HotToaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexusCRM | Powering Every Surface Area",
  description: "The ultimate platform for smart dashboards, lead management, and seamless integrations. Run your entire operation from one powerful CRM.",
};

import { SyncProvider } from '@/context/SyncContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SyncProvider>
            {children}
          </SyncProvider>
          <HotToaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--card)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--foreground)',
                  secondary: 'var(--background)',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ea3c48',
                  secondary: '#fff',
                },
              },
            }}
          />
          <SonnerToaster richColors position="bottom-right" theme="dark" />
        </ThemeProvider>
      </body>
    </html>
  );
}
