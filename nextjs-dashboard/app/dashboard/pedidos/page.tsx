"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Pedido,
  Cliente,
  Producto,
  getClientes,
  getPedidos,
  createPedido,
  deletePedido,
  updateEstadoPedido,
  EstadoPedido, 
} from "../../lib/api";

export default function PedidosPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clienteId, setClienteId] = useState<number | "">("");
  const [nombrePedido, setNombrePedido] = useState(""); // descripción / dirección del pedido
  const [productos, setProductos] = useState<Producto[]>([
    { nombre: "", precio: 0 },
  ]);

  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | "TODOS">(
    "TODOS"
  );

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [clientesData, pedidosData] = await Promise.all([
        getClientes(),
        getPedidos(),
      ]);
      setClientes(clientesData);
      setPedidos(pedidosData);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error cargando información"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleProductoChange(
    index: number,
    campo: keyof Producto,
    valor: string
  ) {
    const nuevos = [...productos];
    if (campo === "precio") {
      nuevos[index].precio = Number(valor);
    } else {
      nuevos[index].nombre = valor;
    }
    setProductos(nuevos);
  }

  function agregarProducto() {
    setProductos([...productos, { nombre: "", precio: 0 }]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (clienteId === "") {
      setError("Selecciona un cliente");
      return;
    }

    const productosValidos = productos.filter(
      (p) => p.nombre.trim() !== "" && p.precio > 0
    );

    if (productosValidos.length === 0) {
      setError("Agrega al menos un producto con precio mayor a 0");
      return;
    }

    try {
      setError(null);
      await createPedido({
        clienteId: Number(clienteId),
        nombre: nombrePedido || undefined,
        productos: productosValidos,
      } as Pedido);
      setClienteId("");
      setNombrePedido("");
      setProductos([{ nombre: "", precio: 0 }]);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Error creando pedido");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Seguro que deseas eliminar este pedido?")) return;
    try {
      await deletePedido(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Error al eliminar pedido");
    }
  }

  async function handleCambiarEstado(id: number, nuevoEstado: EstadoPedido) {
    try {
      await updateEstadoPedido(id, nuevoEstado);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Error al cambiar estado del pedido");
    }
  }

  const pedidosFiltrados =
    filtroEstado === "TODOS"
      ? pedidos
      : pedidos.filter((p) => (p.estado || "PENDIENTE") === filtroEstado);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Pedidos</h2>

      {/* ======= FORMULARIO ======= */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-lg p-4 space-y-4 shadow-sm"
      >
        <h3 className="font-semibold text-lg">Nuevo pedido</h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Cliente */}
          <div>
            <label htmlFor="cliente" className="block text-sm mb-1">
              Cliente
            </label>
            <select
              id="cliente"
              className="w-full border rounded px-2 py-1"
              value={clienteId}
              onChange={(e) =>
                setClienteId(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              required
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.correo})
                </option>
              ))}
            </select>
          </div>

          {/* Nombre / descripción / dirección */}
          <div>
            <label htmlFor="nombrePedido" className="block text-sm mb-1">
              Nombre / descripción del pedido
            </label>
            <input
              id="nombrePedido"
              className="w-full border rounded px-2 py-1"
              placeholder="Ej: Pedido semanal, Dirección de entrega..."
              value={nombrePedido}
              onChange={(e) => setNombrePedido(e.target.value)}
            />
          </div>
        </div>

        {/* Productos */}
        <div>
          <h4 className="font-semibold mb-2">Productos</h4>
          {productos.map((p, index) => (
            <div key={index} className="grid md:grid-cols-2 gap-2 mb-2">
              <div>
                <label
                  htmlFor={`prod-nombre-${index}`}
                  className="block text-sm mb-1"
                >
                  Nombre
                </label>
                <input
                  id={`prod-nombre-${index}`}
                  className="w-full border rounded px-2 py-1"
                  value={p.nombre}
                  onChange={(e) =>
                    handleProductoChange(index, "nombre", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label
                  htmlFor={`prod-precio-${index}`}
                  className="block text-sm mb-1"
                >
                  Precio
                </label>
                <input
                  id={`prod-precio-${index}`}
                  type="number"
                  step="0.01"
                  className="w-full border rounded px-2 py-1"
                  value={p.precio}
                  onChange={(e) =>
                    handleProductoChange(index, "precio", e.target.value)
                  }
                  required
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={agregarProducto}
            className="mt-2 px-3 py-1 rounded bg-blue-500 text-white text-sm"
          >
            + Agregar producto
          </button>
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
        >
          Guardar pedido
        </button>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </form>

      {/* ======= FILTRO DE ESTADO ======= */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Listado de pedidos</h3>
        <div className="flex items-center gap-2 text-sm">
          <span>Filtrar por estado:</span>
            <select
            aria-label="Filtro de estado"        // ✅ añadido
            value={filtroEstado}
            onChange={(e) =>
              setFiltroEstado(e.target.value as EstadoPedido | "TODOS")
            }
            className="border rounded px-2 py-1"
          >
            <option value="TODOS">Todos</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="FACTURADO">Facturados</option>
            <option value="ANULADO">Anulados</option>
          </select>

        </div>
      </div>

      {/* ======= LISTADO ======= */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        {loading && <p>Cargando...</p>}
        {!loading && pedidosFiltrados.length === 0 && (
          <p>No hay pedidos aún.</p>
        )}
        {!loading && pedidosFiltrados.length > 0 && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-2 text-left text-sm">ID</th>
                <th className="p-2 text-left text-sm">Cliente</th>
                <th className="p-2 text-left text-sm">Nombre pedido</th>
                <th className="p-2 text-left text-sm">Productos</th>
                <th className="p-2 text-left text-sm">Total</th>
                <th className="p-2 text-left text-sm">Estado</th>
                <th className="p-2 text-left text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((p) => (
                <tr
                  key={p.id}
                  className="border-b hover:bg-gray-50 align-top"
                >
                  <td className="p-2 text-sm">{p.id}</td>
                  <td className="p-2 text-sm">
                    {
                      clientes.find((c) => c.id === p.clienteId)?.nombre ||
                      p.clienteId
                    }
                  </td>
                  <td className="p-2 text-sm">
                    {p.nombre ? p.nombre : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="p-2 text-sm">
                    {p.productos?.length ? (
                      <ul className="list-disc pl-4">
                        {p.productos.map((prod, i) => (
                          <li key={i}>
                            {prod.nombre} — Q{prod.precio.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <i className="text-gray-500">Sin productos</i>
                    )}
                  </td>
                  <td className="p-2 text-sm font-semibold">
                    Q {p.total?.toFixed ? p.total.toFixed(2) : p.total}
                  </td>
                  <td className="p-2 text-sm">
                    <select
                  aria-label={`Cambiar estado del pedido ${p.id}`}   // ✅ añadido
                  value={p.estado || "PENDIENTE"}
                  onChange={(e) =>
                    handleCambiarEstado(p.id!, e.target.value as EstadoPedido)
                  }
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="FACTURADO">Facturado</option>
                  <option value="ANULADO">Anulado</option>
                </select>
                  </td>
                  <td className="p-2 text-sm">
                    <button
                      onClick={() => handleDelete(p.id!)}
                      className="text-red-600 hover:underline"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
