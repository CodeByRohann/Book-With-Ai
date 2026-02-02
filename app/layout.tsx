import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";


export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3002'),
  title: "Book With Ai | Smart Travel Itinerary Generator",
  description:
    "Plan your perfect trip in seconds with our AI-powered Trip Planner. Get personalized itineraries, hotel recommendations, and activity suggestions with just one click!",
  keywords: [
    "Book With Ai",
    "Travel Itinerary Generator",
    "Smart Trip Planner",
    "AI Travel Assistant",
    "Best Trip Planning App",
    "AI Vacation Planner",
    "Next.js Book With Ai",
  ],
  authors: [{ name: "TubeGuruji" }],
  openGraph: {
    title: "Book With Ai | Smart Travel Itinerary Generator",
    description:
      "Plan trips effortlessly with AI! Create detailed travel itineraries, find top destinations, and discover the best hotels and activities instantly.",
    url: "https://yourdomain.com",
    siteName: "Book With Ai",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Book With Ai Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Book With Ai | Smart Travel Itinerary Generator",
    description:
      "Your personal AI travel assistant – plan trips, book hotels, and explore destinations in seconds.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.webmanifest",
};


const outfit = Outfit({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark')
                  } else {
                    document.documentElement.classList.remove('dark')
                  }
                } catch (_) {}
              `,
            }}
          />
        </head>
        <body
          className={outfit.className}
          suppressHydrationWarning
        >
          {/* Author: Sanket - Error boundary prevents app crashes */}
          <ErrorBoundary>
            <ThemeProvider>
              <ConvexClientProvider>
                {children}
              </ConvexClientProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
