'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error en /dashboard/invoices:', error);
  }, [error]);

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center text-2xl font-semibold text-red-600">
        ¡Algo salió mal!
      </h2>
      <p className="mt-2 text-gray-500 text-center">
        No se pudo cargar la información de facturas. Intenta de nuevo.
      </p>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-400"
        onClick={() => reset()}
      >
        Reintentar
      </button>
    </main>
  );
}
