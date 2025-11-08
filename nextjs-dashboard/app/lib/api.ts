// lib/api.ts

/* ========= CONFIGURACIÓN BASE ========= */
const API_CLIENTES =
  process.env.NEXT_PUBLIC_API_CLIENTES || "http://localhost:8080";
const API_PROVEEDORES =
  process.env.NEXT_PUBLIC_API_PROVEEDORES || "http://localhost:8081";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

/* ========= CLIENTES ========= */
export interface Cliente {
  id?: number;
  nombre: string;
  correo: string;
  telefono?: string;
  direccion?: string;
}

export async function getClientes(): Promise<Cliente[]> {
  const res = await fetch(`${API_CLIENTES}/clientes`, { cache: "no-store" });
  return handleResponse<Cliente[]>(res);
}

export async function createCliente(cliente: Cliente): Promise<Cliente> {
  const res = await fetch(`${API_CLIENTES}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  return handleResponse<Cliente>(res);
}

// 🔹 Actualizar cliente
export async function updateCliente(
  id: number,
  cliente: Cliente
): Promise<Cliente> {
  const res = await fetch(`${API_CLIENTES}/clientes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  return handleResponse<Cliente>(res);
}

// 🔹 Eliminar cliente
export async function deleteCliente(id: number): Promise<void> {
  const res = await fetch(`${API_CLIENTES}/clientes/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Error eliminando cliente ID ${id}`);
}

// 🔹 Obtener detalle de cliente
export async function getClienteById(id: number): Promise<Cliente> {
  const res = await fetch(`${API_CLIENTES}/clientes/${id}`, {
    cache: "no-store",
  });
  return handleResponse<Cliente>(res);
}

/* ========= PEDIDOS ========= */
export interface Producto {
  nombre: string;
  precio: number;
}

// 🔹 Tipo de estado de pedido
export type EstadoPedido = "PENDIENTE" | "FACTURADO" | "ANULADO";

export interface Pedido {
  id?: number;
  clienteId: number;
  nombre?: string; // nombre / descripción / dirección / observación
  productos: Producto[];
  total?: number;
  estado?: EstadoPedido; // campo nuevo tipado
}

// 🔹 Obtener pedidos
export async function getPedidos(): Promise<Pedido[]> {
  const res = await fetch(`${API_CLIENTES}/pedidos`, { cache: "no-store" });
  return handleResponse<Pedido[]>(res);
}

// 🔹 Crear pedido
export async function createPedido(pedido: Pedido): Promise<Pedido> {
  const res = await fetch(`${API_CLIENTES}/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clienteId: pedido.clienteId,
      nombre: pedido.nombre, // descripción o dirección del pedido
      productos: pedido.productos,
      // estado no es necesario: backend lo pone "PENDIENTE"
    }),
  });
  return handleResponse<Pedido>(res);
}

// 🔹 Eliminar pedido
export async function deletePedido(id: number): Promise<void> {
  const res = await fetch(`${API_CLIENTES}/pedidos/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Error eliminando pedido ID ${id}`);
}

// 🔹 Cambiar estado del pedido (PENDIENTE, FACTURADO, ANULADO)
export async function updateEstadoPedido(
  id: number,
  estado: EstadoPedido
): Promise<Pedido> {
  const res = await fetch(
    `${API_CLIENTES}/pedidos/${id}/estado?estado=${estado}`,
    {
      method: "PUT",
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error cambiando estado del pedido ${id}: ${text}`);
  }
  return handleResponse<Pedido>(res);
}

/* ========= PROVEEDORES ========= */
export interface Proveedor {
  id?: number;
  nombre: string;
  correo: string;
  telefono?: string;
  direccion?: string;
}

export async function getProveedores(): Promise<Proveedor[]> {
  const res = await fetch(`${API_PROVEEDORES}/proveedores`, {
    cache: "no-store",
  });
  return handleResponse<Proveedor[]>(res);
}

export async function createProveedor(
  proveedor: Proveedor
): Promise<Proveedor> {
  const res = await fetch(`${API_PROVEEDORES}/proveedores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proveedor),
  });
  return handleResponse<Proveedor>(res);
}

// 🔹 Actualizar proveedor
export async function updateProveedor(
  id: number,
  proveedor: Proveedor
): Promise<Proveedor> {
  const res = await fetch(`${API_PROVEEDORES}/proveedores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proveedor),
  });
  return handleResponse<Proveedor>(res);
}

// 🔹 Eliminar proveedor
export async function deleteProveedor(id: number): Promise<void> {
  const res = await fetch(`${API_PROVEEDORES}/proveedores/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Error eliminando proveedor ID ${id}`);
}

/* ========= FACTURAS ========= */

// compatible con backend nuevo (pedidoId) y el viejo (id/nombre)
export interface PedidoReferencia {
  id?: number;          // compatibilidad vieja
  pedidoId?: number;    // backend nuevo
  total: number;
  nombre?: string;      // opcional, por si en el futuro lo mandas
}

export interface Factura {
  id?: number;
  proveedorId: number;
  monto: number;
  fecha?: string;
  estado?: "ACTIVA" | "ANULADA";
  motivoAnulacion?: string | null;
  pedidos?: PedidoReferencia[] | null;
}

export async function getFacturas(): Promise<Factura[]> {
  const res = await fetch(`${API_PROVEEDORES}/facturas`, { cache: "no-store" });
  return handleResponse<Factura[]>(res);
}

export async function createFactura(factura: {
  proveedorId: number;
  monto: number;
}): Promise<Factura> {
  const res = await fetch(`${API_PROVEEDORES}/facturas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(factura),
  });
  return handleResponse<Factura>(res);
}

// 🔹 Detalle de factura
export async function getFacturaDetalle(id: number): Promise<Factura> {
  const res = await fetch(
    `${API_PROVEEDORES}/facturas/detalle/${id}`,
    { cache: "no-store" }
  );
  return handleResponse<Factura>(res);
}

// 🔹 Anular factura con motivo
export async function anularFactura(
  id: number,
  motivo: string
): Promise<Factura> {
  const params = new URLSearchParams({ motivo });
  const res = await fetch(
    `${API_PROVEEDORES}/facturas/${id}/anular?${params.toString()}`,
    { method: "PUT" }
  );
  return handleResponse<Factura>(res);
}

// (Opcional) Si tu backend NO tiene delete, no uses esta función
export async function deleteFactura(id: number): Promise<void> {
  const res = await fetch(`${API_PROVEEDORES}/facturas/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Error eliminando factura ID ${id}`);
}

/* ========= AUTH / USUARIOS ========= */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Error ${res.status}: ${msg || res.statusText}`);
  }

  return res.json();
}
