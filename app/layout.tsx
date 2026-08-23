import type { Metadata } from "next";
import "./globals.css";

const configuredPublicSite = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const publicMetadataBase = configuredPublicSite ? new URL(configuredPublicSite) : undefined;
const publicSocialImage = publicMetadataBase ? new URL("/og.png", publicMetadataBase) : undefined;

export const metadata: Metadata = {
  ...(publicMetadataBase ? { metadataBase: publicMetadataBase } : {}),
  title: "CHUDO — публичный демо-прототип",
  description: "Публичный демо-прототип CHUDO: кошелёк, симулированный рынок, чаты, звонки, защита и панель пула без production backend.",
  openGraph: {
    title: "CHUDO — публичный демо-прототип",
    description: "Кошелёк, симулированный рынок, чаты, демо-звонки, защита и панель пула без production backend.",
    ...(publicSocialImage ? { images: [{ url: publicSocialImage, width: 1200, height: 630, alt: "CHUDO — PUBLIC DEMO / SIMULATED" }] } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: "CHUDO — публичный демо-прототип",
    description: "Кошелёк, симулированный рынок, чаты, демо-звонки, защита и панель пула без production backend.",
    ...(publicSocialImage ? { images: [publicSocialImage] } : {}),
  },
  icons: { icon: "/chudo-icon.png", shortcut: "/chudo-icon.png", apple: "/chudo-icon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
