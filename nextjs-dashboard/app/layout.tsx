import './global.css';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | MultiPedidos Dashboard',
    default: 'MultiPedidos Dashboard',
  },
  description: 'Panel administrativo de pedidos creado con Next.js, TypeScript y Tailwind.',
  metadataBase: new URL('https://multipedidos-dashboard.vercel.app'),
};
 
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-100`}>{children}</body>
    </html>
  );
}
