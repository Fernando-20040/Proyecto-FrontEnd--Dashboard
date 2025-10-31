import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import {
  fetchRevenue,
  fetchLatestInvoices,
  fetchCardData,
} from '@/app/lib/data';

export default async function Page() {
  // 🔹 Obtenemos todos los datos en paralelo para mayor rendimiento
  const [revenue, latestInvoices, cardData] = await Promise.all([
    fetchRevenue(),
    fetchLatestInvoices(),
    fetchCardData(),
  ]);

  const {
    numberOfCustomers,
    numberOfInvoices,
    totalPaidInvoices,
    totalPendingInvoices,
  } = cardData;

  return (
    <main className="p-6 md:p-12">
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard - MultiPedidos
      </h1>

      {/* ===== Tarjetas resumen ===== */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Facturas Cobradas" value={totalPaidInvoices} type="collected" />
        <Card title="Facturas Pendientes" value={totalPendingInvoices} type="pending" />
        <Card title="Total Facturas" value={numberOfInvoices} type="invoices" />
        <Card title="Total Clientes" value={numberOfCustomers} type="customers" />
      </div>

      {/* ===== Gráfico e Invoices recientes ===== */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <div className="md:col-span-4 lg:col-span-5">
          <RevenueChart revenue={revenue} />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <LatestInvoices latestInvoices={latestInvoices} />
        </div>
      </div>
    </main>
  );
}
