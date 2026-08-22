import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://chudo-app-prototype.chudzinovich.chatgpt.site"),
  title: "CHUDO — мессенджер и кошелёк",
  description: "Интерактивный прототип суверенного мессенджера, кошелька и защиты CHUDO.",
  openGraph: {
    title: "CHUDO — мессенджер и кошелёк",
    description: "Связь. Деньги. Свобода. Интерактивный прототип CHUDO.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "CHUDO — Связь. Деньги. Свобода." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CHUDO — мессенджер и кошелёк",
    description: "Связь. Деньги. Свобода. Интерактивный прототип CHUDO.",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
