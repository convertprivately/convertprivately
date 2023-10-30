import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@picocss/pico";
import { Header } from "@/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuickLodge",
  description: "Tools by Alphy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
