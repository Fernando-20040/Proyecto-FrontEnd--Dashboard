import Link from 'next/link';
import { FaceFrownIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-3">
      <FaceFrownIcon className="w-12 text-gray-400" />
      <h2 className="text-xl font-semibold">404 - Factura no encontrada</h2>
      <p className="text-gray-500">
        La factura que buscas no existe o fue eliminada.
      </p>
      <Link
        href="/dashboard/invoices"
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-400"
      >
        Volver al listado
      </Link>
    </main>
  );
}
