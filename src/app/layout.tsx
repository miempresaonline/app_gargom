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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('gargom-theme') || 'light';
                const map = {
                  light: 'theme-light',
                  midnight: 'theme-dark-midnight',
                  emerald: 'theme-light-emerald',
                  carbon: 'theme-dark-carbon'
                };
                document.documentElement.classList.add(map[theme] || 'theme-light');
              } catch (e) {}
            `
          }}
        />
      </head>
      <body className={`${inter.className} bg-gargom-bg text-gargom-text min-h-screen flex transition-colors duration-300`}>
        <LayoutWrapper sidebar={<Sidebar />}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
