import "./global.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import CustomSessionProvider from "./ui/components/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | MultiPedidos Dashboard",
    default: "MultiPedidos Dashboard",
  },
  description:
    "Panel administrativo de pedidos creado con Next.js, TypeScript y Tailwind.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        {/* 🔹 SessionProvider para que NextAuth funcione globalmente */}
        <CustomSessionProvider>
          <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
            <h1 className="font-bold text-xl">MultiPedidos</h1>
            <nav className="flex gap-4 text-sm md:text-base">
              <Link href="/">Inicio</Link>
              <Link href="/dashboard">Dashboard</Link>
            </nav>
          </header>
          <main className="p-6 max-w-6xl mx-auto">{children}</main>
        </CustomSessionProvider>
      </body>
    </html>
  );
}
