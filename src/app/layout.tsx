import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "../../styles/globals.css";
import { Header } from "@/Header";

import { Footer } from "@/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Convert Privately",
  description: "Conversion tool that works locally without uploading files.",
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

        <Footer/>
      </body>
    </html>
  );
}
