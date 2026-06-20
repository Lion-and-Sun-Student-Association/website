import type { Metadata } from "next";
import { Crimson_Text, EB_Garamond, Lato, Libre_Caslon_Text } from "next/font/google";
import "./globals.css";
import PublicBackdrop from "@/app/components/PublicBackdrop";
import Navbar from "@/app/components/Navbar";
import { ThemeProvider } from "@/app/components/theme/ThemeProvider";
import { defaultLocale, direction } from "@/i18n/config";
import { getNames } from "@/lib/getNames";

const crimson = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const libreCaslon = Libre_Caslon_Text({
  variable: "--font-libre-caslon",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "LSSA",
};

// Re-read the CSV periodically so newly added names appear without a redeploy
// (effective when the file is updatable at runtime; otherwise refreshes per deploy).
export const revalidate = 3600;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const names = await getNames();

  return (
    <html
      lang={defaultLocale}
      dir={direction[defaultLocale]}
      data-theme="dark"
      className={`${crimson.variable} ${ebGaramond.variable} ${lato.variable} ${libreCaslon.variable}`}
    >
      <body>
        <ThemeProvider>
          <PublicBackdrop names={names} />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
