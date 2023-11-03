import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@picocss/pico";
import "../../styles/globals.css"
import { Header } from "@/Header";
import { Explainer } from "@/Explainer";
import { Footer } from "@/Footer";

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
    <html lang="en" style=
    {
      {
        background:"black"
      }
    }>

      <body className={`${inter.className} bg-black  mx-auto flex flex-col justify-center`} >
        <Header />
        {children}
        <Explainer/>
        <Footer/>
      </body>
    </html>
  );
}
