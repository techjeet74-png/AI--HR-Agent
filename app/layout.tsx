import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agrolt HR AI Agent",
  description: "AI-powered HR command center for Agrolt Solutions Pvt Ltd"
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}