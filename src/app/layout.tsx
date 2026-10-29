import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, Manrope } from "next/font/google";
import { Consent } from "@/components/layout/consent";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ScrollReveal } from "@/components/layout/scroll-reveal";
import { TiltController } from "@/components/layout/tilt-controller";
import { AssistantWidget } from "@/components/tools/assistant-widget";
import { JsonLd } from "@/components/ui/json-ld";
import { site } from "@/config/site";
import { orgJsonLd } from "@/lib/seo";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap", weight: ["500", "600", "700", "800"] });
const serif = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], display: "swap", weight: "400", style: ["normal", "italic"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | Digital Marketing and Website Development Agency`, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: { siteName: site.name, type: "website", locale: "en" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0B1020" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${serif.variable} ${inter.variable}`}>
      <head>
        {/* Marks JS as available so scroll-reveal can hide content only when it can also reveal it. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <div className="scroll-progress" aria-hidden="true" />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <ScrollReveal />
        <TiltController />
        <Consent />
        <AssistantWidget />
        <JsonLd data={orgJsonLd()} />
      </body>
    </html>
  );
}
