import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Footer } from "./components/layout/footer";
import { Providers } from "./providers";
import { AppShell } from "./components/layout/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Self-hosted SF Pro Display — Next.js serves these from your own domain,
// preloads them, and sets font-display: swap automatically. No third-party
// network request at runtime, unlike Option A's CDN link.
const sfPro = localFont({
  src: [
    { path: "./font/SFProDisplay-Regular.woff2", weight: "400", style: "normal" },
    { path: "./font/SFProDisplay-Medium.woff2", weight: "500", style: "normal" },
    { path: "./font/SFProDisplay-Semibold.woff2", weight: "600", style: "normal" },
    { path: "./font/SFProDisplay-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sf-pro",
  display: "swap",
});

export const metadata = {
  title: "Svastha",
  description: "School Management Program",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/logo.svg", type: "image/svg", sizes: "any" },
    ],
    shortcut: "/logo.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sfPro.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sf">
        <Providers>
          <AppShell>{children}</AppShell>
          {/* <Footer /> */}
        </Providers>
      </body>
    </html>
  );
}