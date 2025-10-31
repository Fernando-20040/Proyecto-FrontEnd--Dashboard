// /app/ui/skeletons.tsx
import { lusitana } from '@/app/ui/fonts';

export function DashboardSkeleton() {
  return (
    <main className="p-6 md:p-12 animate-pulse">
      <div className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Cargando Panel de Control...
      </div>

      {/* Tarjetas */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CardsSkeleton />
      </div>

      {/* Gráfico e Invoices */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChartSkeleton />
        <LatestInvoicesSkeleton />
      </div>
    </main>
  );
}

export function CardsSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-gray-100 p-4 shadow-sm h-32 flex flex-col justify-center"
        >
          <div className="h-4 w-1/3 bg-gray-300 rounded mb-3"></div>
          <div className="h-8 w-2/3 bg-gray-200 rounded"></div>
        </div>
      ))}
    </>
  );
}

export function RevenueChartSkeleton() {
  return (
    <div className="rounded-xl bg-gray-100 p-4 shadow-sm md:col-span-4 lg:col-span-5 animate-pulse">
      <div className="h-6 w-1/3 bg-gray-300 mb-4 rounded"></div>
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded"></div>
        ))}
      </div>
      <div className="h-4 w-1/4 bg-gray-300 mt-6 rounded"></div>
    </div>
  );
}

export function InvoicesTableSkeleton() {
  return (
    <div className="mt-8 w-full animate-pulse">
      <div className="h-10 w-1/3 rounded bg-gray-200 mb-6"></div>
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-12 w-full rounded-md bg-gray-100 border border-gray-200"
          ></div>
        ))}
      </div>
    </div>
  );
}

export function LatestInvoicesSkeleton() {
  return (
    <div className="rounded-xl bg-gray-100 p-4 shadow-sm md:col-span-2 lg:col-span-3 animate-pulse">
      <div className="h-6 w-1/3 bg-gray-300 mb-4 rounded"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-t border-gray-200 py-3"
          >
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
              <div>
                <div className="h-4 w-24 bg-gray-300 mb-2 rounded"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="h-4 w-12 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
