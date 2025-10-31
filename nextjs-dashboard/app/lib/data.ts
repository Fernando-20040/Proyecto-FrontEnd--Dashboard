import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

// 🧩 Endpoints base de tus microservicios
const API_CLIENTES = 'http://localhost:8080';
const API_PROVEEDORES = 'http://localhost:8081';

/* =====================
   Funciones adaptadas
===================== */

// 📊 Simula ingresos totales (basado en facturas del microservicio B)
export async function fetchRevenue() {
  try {
    const res = await fetch(`${API_PROVEEDORES}/facturas`);
    if (!res.ok) throw new Error('Error al obtener facturas');

    const facturas = await res.json();
    const total = facturas.reduce((acc: number, f: any) => acc + f.totalFactura, 0);

    const data: Revenue[] = [
      { month: 'Total', revenue: total },
      { month: 'Enero', revenue: total * 0.1 },
      { month: 'Febrero', revenue: total * 0.2 },
      { month: 'Marzo', revenue: total * 0.3 },
    ];

    return data;
  } catch (error) {
    console.error('Error obteniendo ingresos:', error);
    throw new Error('No se pudieron obtener los datos de ingresos.');
  }
}

// 🧾 Últimas facturas (Microservicio B)
export async function fetchLatestInvoices() {
  try {
    const res = await fetch(`${API_PROVEEDORES}/facturas`);
    if (!res.ok) throw new Error('Error al obtener facturas');

    const data = await res.json();
    const latest = data.slice(-5).reverse(); // últimas 5

    const latestInvoices = latest.map((f: any) => ({
      id: f.id,
      amount: formatCurrency(f.totalFactura),
      name: `Proveedor ${f.proveedorId}`,
      email: `proveedor${f.proveedorId}@empresa.com`,
      image_url: '/placeholder.png',
    }));

    return latestInvoices;
  } catch (error) {
    console.error('Error obteniendo últimas facturas:', error);
    throw new Error('No se pudieron obtener las últimas facturas.');
  }
}

// 📈 Datos de tarjetas del dashboard (Clientes y Facturas)
export async function fetchCardData() {
  try {
    const [clientesRes, facturasRes] = await Promise.all([
      fetch(`${API_CLIENTES}/clientes`),
      fetch(`${API_PROVEEDORES}/facturas`),
    ]);

    if (!clientesRes.ok || !facturasRes.ok)
      throw new Error('Error al obtener datos de clientes o facturas');

    const clientes = await clientesRes.json();
    const facturas = await facturasRes.json();

    const numberOfCustomers = clientes.length;
    const numberOfInvoices = facturas.length;
    const totalPaidInvoices = formatCurrency(
      facturas.reduce((sum: number, f: any) => sum + (f.status === 'paid' ? f.totalFactura : 0), 0),
    );
    const totalPendingInvoices = formatCurrency(
      facturas.reduce((sum: number, f: any) => sum + (f.status === 'pending' ? f.totalFactura : 0), 0),
    );

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Error obteniendo datos de tarjetas:', error);
    throw new Error('No se pudieron obtener los datos del panel.');
  }
}

/* =====================
   Funciones de soporte
===================== */

// Paginación de facturas
const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    const res = await fetch(`${API_PROVEEDORES}/facturas`);
    if (!res.ok) throw new Error('Error al obtener facturas');
    const data = await res.json();

    const filtered = data.filter((f: any) =>
      String(f.id).includes(query) || String(f.totalFactura).includes(query),
    );

    return filtered.slice(offset, offset + ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Error obteniendo facturas filtradas:', error);
    throw new Error('No se pudieron obtener las facturas filtradas.');
  }
}

// Total de páginas (para paginación)
export async function fetchInvoicesPages(query: string) {
  try {
    const res = await fetch(`${API_PROVEEDORES}/facturas`);
    if (!res.ok) throw new Error('Error al obtener facturas');
    const data = await res.json();

    const filtered = data.filter((f: any) =>
      String(f.id).includes(query) || String(f.totalFactura).includes(query),
    );

    return Math.ceil(filtered.length / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Error obteniendo total de páginas:', error);
    throw new Error('No se pudo calcular el número total de páginas.');
  }
}

// Obtener una factura por ID
export async function fetchInvoiceById(id: string) {
  try {
    const res = await fetch(`${API_PROVEEDORES}/facturas/${id}`);
    if (!res.ok) throw new Error('Factura no encontrada');

    const data = await res.json();
    return { ...data, amount: data.totalFactura };
  } catch (error) {
    console.error('Error obteniendo factura por ID:', error);
    throw new Error('No se pudo obtener la factura.');
  }
}

// Obtener todos los clientes
export async function fetchCustomers() {
  try {
    const res = await fetch(`${API_CLIENTES}/clientes`);
    if (!res.ok) throw new Error('Error al obtener clientes');

    const data = await res.json();
    const customers: CustomerField[] = data.map((c: any) => ({
      id: c.id,
      name: c.nombre,
    }));

    return customers;
  } catch (err) {
    console.error('Error obteniendo clientes:', err);
    throw new Error('No se pudieron obtener los clientes.');
  }
}

// Buscar clientes filtrados
export async function fetchFilteredCustomers(query: string) {
  try {
    const res = await fetch(`${API_CLIENTES}/clientes`);
    if (!res.ok) throw new Error('Error al obtener clientes');

    const data = await res.json();

    const filtered = data.filter(
      (c: any) =>
        c.nombre.toLowerCase().includes(query.toLowerCase()) ||
        c.correo.toLowerCase().includes(query.toLowerCase()),
    );

    const customers = filtered.map((c: any) => ({
      id: c.id,
      name: c.nombre,
      email: c.correo,
      image_url: '/placeholder.png',
      total_invoices: 0,
      total_pending: formatCurrency(0),
      total_paid: formatCurrency(0),
    }));

    return customers;
  } catch (err) {
    console.error('Error filtrando clientes:', err);
    throw new Error('No se pudieron obtener los clientes filtrados.');
  }
}
