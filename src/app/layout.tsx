import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";

import "./globals.css";

import StyledComponentsRegistry from "@/lib/registry";
import ThemeProvider from "@/providers/theme";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Single Click Application",
  description: "BigCommerce Single Click Application",
};

export const runtime = "nodejs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={sourceSans.className}>
        <StyledComponentsRegistry>
          <ThemeProvider>{children}</ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
