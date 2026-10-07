import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
export const metadata: Metadata = { title: { default: "Staff Pantry · Everyday favourites, staff prices", template: "%s · Staff Pantry" }, description: "A simple, secure staff sales experience. Browse dairy, drinks and pantry favourites, place a verified employee order and manage it before the deadline.", robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={geist.variable}><body><a className="skip-link" href="#main-content">Skip to content</a><div id="main-content" tabIndex={-1}>{children}</div></body></html>;
}
