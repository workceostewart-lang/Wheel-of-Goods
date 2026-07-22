import type { Metadata, Viewport } from "next";
import { Archivo_Black, Nunito_Sans } from "next/font/google";
import "./globals.css";

const display = Archivo_Black({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const body = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wheel-of-goods.fantomzone.app"),
  title: "Wheel of Goods | Fantom Zone Arcade",
  description: "Spin the rainbow wheel, find the top survey answers, and build a game-night fortune.",
  applicationName: "Wheel of Goods",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "Wheel of Goods",
    description: "Every answer has a price. Spin, answer, and win!",
    type: "website",
    siteName: "Fantom Zone Arcade",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Wheel of Goods rainbow prize wheel" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wheel of Goods",
    description: "Every answer has a price. Spin, answer, and win!",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#111856",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
