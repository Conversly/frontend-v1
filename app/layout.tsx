import AppContextProvider from "@/contexts";
import { merge } from "@/utils/ui";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  preload: true,
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  preload: true,
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trench",
  description:
    "One-click sniping, blazing trades, and lower fees—because bull run's too short for slow trades",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isTesting = process.env.NEXT_PUBLIC_TESTING_ENABLED === "true";

  return (
    <html lang="en">
      {isTesting && (
        <head>
          <script
            crossOrigin="anonymous"
            src="//unpkg.com/react-scan/dist/auto.global.js"
          />
        </head>
      )}
      <body
        className={merge(
          geist.variable,
          geistMono.variable,
          "body antialiased",
        )}
      >
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
        >
            <AppContextProvider>{children}</AppContextProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
