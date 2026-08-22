import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://chudo-app-prototype.chudzinovich.chatgpt.site"),
  title: "CHUDO — связь, кошелёк и рынок",
  description: "Интерактивный демо-прототип CHUDO: мессенджер, аудио- и видеозвонки, кошелёк, рынок и центр защиты.",
  openGraph: {
    title: "CHUDO — связь, кошелёк и рынок",
    description: "Связь, демо-звонки, кошелёк, биржа и защита в интерактивном прототипе CHUDO.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "CHUDO — Связь. Деньги. Свобода." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CHUDO — связь, кошелёк и рынок",
    description: "Связь, демо-звонки, кошелёк, биржа и защита в интерактивном прототипе CHUDO.",
    images: ["/og.png"],
  },
  icons: { icon: "/chudo-icon.png", shortcut: "/chudo-icon.png", apple: "/chudo-icon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
