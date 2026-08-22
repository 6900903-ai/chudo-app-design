import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CHUDO — мессенджер и кошелёк",
  description: "Интерактивный прототип суверенного мессенджера, кошелька и защиты CHUDO.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
