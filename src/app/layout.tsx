import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gargom ERP | Gestión de Obras",
  description: "Plataforma de gestión integral de Construcciones Gargom",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gargom-bg text-gargom-text min-h-screen flex`}>
        <LayoutWrapper sidebar={<Sidebar />}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
