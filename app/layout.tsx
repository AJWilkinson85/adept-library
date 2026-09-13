import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: { default: "The Adept Library", template: "%s · The Adept Library" },
  description:
    "Written lessons in practical AI literacy for owner-operators. Included with Advisor on Call from Adept Advisors.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_HREF} />
      </head>
      <body>
        <Header />
        <main className="main">{children}</main>
        <footer className="footer">
          <div className="wrap footer__inner">
            <span>© {new Date().getFullYear()} Adept Advisors · Phoenix, AZ</span>
            <span><a href="/privacy">Privacy</a> · <a href="https://adeptadvisors.com">adeptadvisors.com</a></span>
          </div>
        </footer>
      </body>
    </html>
  );
}
