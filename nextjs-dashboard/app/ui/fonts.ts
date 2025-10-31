import { Inter, Lusitana } from 'next/font/google';

// Fuente principal: Inter
export const inter = Inter({ subsets: ['latin'] });

// Fuente secundaria: Lusitana (normal y negrita)
export const lusitana = Lusitana({
  subsets: ['latin'],
  weight: ['400', '700'],
});
