import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "react-datepicker/dist/react-datepicker.css";
import "./globals.css";
import { Footer } from "./components/layout/footer";
import { Providers } from "./providers";
import { AppShell } from "./components/layout/app-shell";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

// Self-hosted Comfortaa — chosen in Settings > Appearance > App typeface.
const comfortaa = localFont({
  src: [
    { path: "./font/Comfortaa-Light.ttf", weight: "300", style: "normal" },
    { path: "./font/Comfortaa-Regular.ttf", weight: "400", style: "normal" },
    { path: "./font/Comfortaa-Medium.ttf", weight: "500", style: "normal" },
    { path: "./font/Comfortaa-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./font/Comfortaa-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-comfortaa-pro",
  display: "swap",
});


const fraunces = localFont({
  src: [
    { path: "./font/Fraunces_72pt-Light.ttf", weight: "300", style: "normal" },
    { path: "./font/Fraunces_72pt-Regular.ttf", weight: "400", style: "normal" },
    { path: "./font/Fraunces_72pt-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./font/Fraunces_72pt-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-fraunces-pro",
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
      className={`${geistSans.variable} ${geistMono.variable} ${sfPro.variable} ${comfortaa.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sf">
        <Providers>
          <ErrorBoundary>
            <AppShell>{children}</AppShell>
          </ErrorBoundary>
          {/* <Footer /> */}
        </Providers>
      </body>
    </html>
  );
}