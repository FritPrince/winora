import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Winora — Bientôt disponible",
  description:
    "Winora, boutique premium de produits digitaux pour l'Afrique francophone. Lancement à venir.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
