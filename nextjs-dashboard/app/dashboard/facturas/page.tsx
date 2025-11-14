"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Factura,
  getFacturas,
  createFactura,
  getProveedores,
  Proveedor,
  PedidoReferencia,
  getFacturaDetalle,
  anularFactura,
  getPedidosPendientes,
  Pedido,
  getClientes,
  Cliente,
} from "../../lib/api";

export default function FacturasPage() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pedidosDisponibles, setPedidosDisponibles] = useState<Pedido[]>([]);
  const [pedidosSeleccionados, setPedidosSeleccionados] = useState<number[]>([]);

  const [proveedorId, setProveedorId] = useState<number | "">("");
  const [clienteId, setClienteId] = useState<number | "">("");

  const [montoManual, setMontoManual] = useState<number | "">("");
  const [descuento, setDescuento] = useState<number | "">("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);

  // ==============================
  // Cargar facturas, proveedores y clientes
  // ==============================
  async function load() {
    setLoading(true);
    try {
      const [facs, provs, clis] = await Promise.all([
        getFacturas(),
        getProveedores(),
        getClientes(),
      ]);
      setFacturas(facs || []);
      setProveedores(provs || []);
      setClientes(clis || []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error cargando datos";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ==============================
  // Cargar pedidos pendientes al seleccionar cliente
  // ==============================
  async function handleClienteChange(idStr: string) {
    const val: number | "" = idStr === "" ? "" : Number(idStr);
    setClienteId(val);
    setPedidosSeleccionados([]);
    setPedidosDisponibles([]);

    if (val !== "") {
      try {
        const data = await getPedidosPendientes(val);
        setPedidosDisponibles(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        const msg =
          e instanceof Error
            ? e.message
            : "Error al cargar pedidos pendientes del cliente";
        alert(msg);
      }
    }
  }

  // ==============================
  // Crear factura
  // ==============================
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (proveedorId === "") {
      setError("Selecciona un proveedor.");
      return;
    }

    // Validación: o pedidos o monto manual
    const tienePedidos = pedidosSeleccionados.length > 0;
    const tieneMontoManual = montoManual !== "" && Number(montoManual) > 0;

    if (!tienePedidos && !tieneMontoManual) {
      setError("Debes seleccionar pedidos o indicar un monto manual.");
      return;
    }

    try {
      setError(null);

      await createFactura({
        proveedorId: Number(proveedorId),
        pedidosIds: tienePedidos ? pedidosSeleccionados : undefined,
        montoManual: tieneMontoManual ? Number(montoManual) : undefined,
        descuentoPorcentaje:
          descuento === "" ? undefined : Number(descuento) || 0,
      });

      // Reset form
      setProveedorId("");
      setClienteId("");
      setMontoManual("");
      setDescuento("");
      setPedidosSeleccionados([]);
      setPedidosDisponibles([]);

      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error creando factura";
      setError(msg);
    }
  }

  // ==============================
  // Ver detalle de factura
  // ==============================
  async function verDetalleFactura(id: number) {
    try {
      const data = await getFacturaDetalle(id);

      // 🔥 Normalizamos aquí: si pedidos viene null/undefined, lo convertimos en []
      setSelectedFactura({
        ...data,
        pedidos: Array.isArray(data.pedidos) ? data.pedidos : [],
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error cargando detalle";
      alert(msg);
    }
  }

  // ==============================
  // Anular factura
  // ==============================
  async function handleAnularFactura(id: number) {
    const motivo = prompt("Motivo de anulación de la factura:");
    if (!motivo || motivo.trim() === "") return;

    try {
      const anulada = await anularFactura(id, motivo.trim());
      setFacturas((prev) => prev.map((f) => (f.id === id ? anulada : f)));
      setSelectedFactura((prev) => (prev && prev.id === id ? anulada : prev));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al anular factura";
      alert(msg);
    }
  }

  // ==============================
  // Calcular resumen contable
  // ==============================
  function calcularResumen(factura: Factura | null) {
    if (!factura) return { subtotal: 0, iva: 0, descuento: 0, total: 0 };

    const subtotal =
      factura.subtotal ??
      (factura.pedidos && factura.pedidos.length > 0
        ? factura.pedidos.reduce((sum, p) => sum + p.total, 0)
        : factura.monto ?? 0);

    const iva = factura.iva ?? Number((subtotal * 0.12).toFixed(2));
    const desc = factura.descuento ?? 0;
    const total = factura.total_factura ?? subtotal + iva - desc;

    return { subtotal, iva, descuento: desc, total };
  }

  const resumen = calcularResumen(selectedFactura);

  // ==============================
  // UI
  // ==============================
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Facturas</h2>

      {/* ================= FORMULARIO ================= */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border p-4 rounded-lg shadow-sm space-y-4"
      >
        <h3 className="font-semibold text-lg mb-2">Nueva Factura</h3>

        {/* Proveedor */}
        <div>
          <label htmlFor="fact-prov" className="block text-sm mb-1">
            Proveedor
          </label>
          <select
            id="fact-prov"
            className="border rounded p-2 w-full"
            value={proveedorId}
            onChange={(e) =>
              setProveedorId(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            required
          >
            <option value="">Selecciona un proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Cliente para pedidos pendientes */}
        <div>
          <label htmlFor="fact-cliente" className="block text-sm mb-1">
            Cliente (para ver pedidos pendientes)
          </label>
          <select
            id="fact-cliente"
            className="border rounded p-2 w-full"
            value={clienteId}
            onChange={(e) => handleClienteChange(e.target.value)}
          >
            <option value="">-- Sin cliente seleccionado --</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.correo})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Si seleccionas un cliente, podrás marcar sus pedidos pendientes para
            incluirlos en la factura.
          </p>
        </div>

        {/* Pedidos pendientes del cliente */}
        <div>
          <label htmlFor="pedidos-list" className="block text-sm mb-1">
            Pedidos pendientes del cliente
          </label>
          <div
            id="pedidos-list"
            className="max-h-40 overflow-y-auto border rounded p-2 text-sm"
          >
            {clienteId === "" && (
              <p className="text-gray-400 italic">
                Selecciona un cliente para ver sus pedidos pendientes.
              </p>
            )}

            {clienteId !== "" && pedidosDisponibles.length === 0 && (
              <p className="text-gray-400 italic">
                El cliente no tiene pedidos pendientes.
              </p>
            )}

            {pedidosDisponibles.length > 0 &&
              pedidosDisponibles.map((p) => (
                <label
                  key={p.id}
                  htmlFor={`pedido-${p.id}`}
                  className="block mb-1 cursor-pointer"
                >
                  <input
                    id={`pedido-${p.id}`}
                    type="checkbox"
                    className="mr-2"
                    checked={pedidosSeleccionados.includes(p.id!)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPedidosSeleccionados((prev) => [...prev, p.id!]);
                      } else {
                        setPedidosSeleccionados((prev) =>
                          prev.filter((idSel) => idSel !== p.id)
                        );
                      }
                    }}
                  />
                  Pedido #{p.id} — Total: Q
                  {p.total?.toFixed(2) ?? "0.00"}
                </label>
              ))}
          </div>
        </div>

        {/* Monto manual */}
        <div>
          <label htmlFor="monto" className="block text-sm mb-1">
            Monto manual (opcional)
          </label>
          <input
            id="monto"
            type="number"
            step="0.01"
            placeholder="Si no seleccionas pedidos, indica un monto manual"
            className="border rounded p-2 w-full"
            value={montoManual}
            onChange={(e) =>
              setMontoManual(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
          />
        </div>

        {/* Descuento */}
        <div>
          <label htmlFor="desc" className="block text-sm mb-1">
            Descuento (%) (opcional)
          </label>
          <input
            id="desc"
            type="number"
            step="0.01"
            min="0"
            max="100"
            className="border rounded p-2 w-full"
            value={descuento}
            onChange={(e) =>
              setDescuento(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
          />
        </div>

        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Crear Factura
        </button>
        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
      </form>

{/* ================= LISTADO ================= */}
<div className="bg-white border p-4 rounded-lg shadow-sm">
  <h3 className="font-semibold text-lg mb-3">Listado de facturas</h3>

  {loading && <p>Cargando...</p>}
  {!loading && facturas.length === 0 && (
    <p className="text-gray-500 italic">No hay facturas aún.</p>
  )}

  {!loading && facturas.length > 0 && (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left">
            <th className="p-3 font-semibold w-10">ID</th>
            <th className="p-3 font-semibold min-w-[180px]">Proveedor</th>

            {/* Alineación profesional para números */}
            <th className="p-3 font-semibold text-right w-28">Subtotal</th>
            <th className="p-3 font-semibold text-right w-24">IVA</th>
            <th className="p-3 font-semibold text-right w-32">Descuento</th>
            <th className="p-3 font-semibold text-right w-32">Total Final</th>

            <th className="p-3 font-semibold w-24">Fecha</th>
            <th className="p-3 font-semibold w-24">Tipo</th>
            <th className="p-3 font-semibold w-24">Estado</th>
            <th className="p-3 font-semibold w-32">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {facturas.map((f) => {
            const subtotalRow =
              f.subtotal ??
              (f.pedidos?.length
                ? f.pedidos.reduce((s, p) => s + p.total, 0)
                : f.monto ?? 0);

            const ivaRow = f.iva ?? Number((subtotalRow * 0.12).toFixed(2));
            const descRow = f.descuento ?? 0;
            const totalRow =
              f.total_factura ?? subtotalRow + ivaRow - descRow;

            return (
              <tr key={f.id} className="hover:bg-gray-50 align-top">
                <td className="p-3">{f.id}</td>

                <td className="p-3">
                  <div className="max-w-[220px] break-words font-medium leading-tight">
                    {proveedores.find((p) => p.id === f.proveedorId)?.nombre ??
                      f.proveedorId}
                  </div>
                </td>

                {/* NÚMEROS ALINEADOS */}
                <td className="p-3 text-right whitespace-nowrap">
                  Q {subtotalRow.toFixed(2)}
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  Q {ivaRow.toFixed(2)}
                </td>

                <td className="p-3 text-right whitespace-nowrap text-red-600">
                  Q {descRow.toFixed(2)}
                </td>

                {/* TOTAL DESTACADO */}
                <td className="p-3 text-right whitespace-nowrap font-bold text-green-700">
                  Q {totalRow.toFixed(2)}
                </td>

                <td className="p-3 whitespace-nowrap">
                  {f.fecha
                    ? new Date(f.fecha).toISOString().split("T")[0]
                    : "-"}
                </td>

                <td className="p-3 whitespace-nowrap">
                  {f.pedidos && f.pedidos.length > 0
                    ? "📜 Automática"
                    : "🧾 Manual"}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      f.estado === "ANULADA"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {f.estado || "ACTIVA"}
                  </span>
                </td>

                <td className="p-3">
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
                    <button
                      onClick={() => verDetalleFactura(f.id!)}
                      className="text-blue-600 hover:underline"
                    >
                      Ver detalle
                    </button>

                    {f.estado !== "ANULADA" && (
                      <button
                        onClick={() => handleAnularFactura(f.id!)}
                        className="text-red-600 hover:underline"
                      >
                        Anular
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )}
</div>


      {/* ================= MODAL DETALLES ================= */}
      {selectedFactura && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] relative">
            <button
              onClick={() => setSelectedFactura(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-600"
            >
              ✖
            </button>

            <h3 className="text-lg font-semibold mb-4">
              Detalles de factura #{selectedFactura.id}
            </h3>

            <p className="text-sm mb-1">
              <strong>Proveedor:</strong>{" "}
              {
                proveedores.find(
                  (p) => p.id === selectedFactura.proveedorId
                )?.nombre
              }
            </p>
            <p className="text-sm mb-1">
              <strong>Fecha:</strong>{" "}
              {selectedFactura.fecha
                ? new Date(selectedFactura.fecha).toISOString().split("T")[0]
                : "-"}
            </p>
            <p className="text-sm mb-3">
              <strong>Estado:</strong>{" "}
              <span
                className={
                  selectedFactura.estado === "ANULADA"
                    ? "text-red-600 font-semibold"
                    : "text-green-600 font-semibold"
                }
              >
                {selectedFactura.estado || "ACTIVA"}
              </span>
            </p>
            {selectedFactura.estado === "ANULADA" &&
              selectedFactura.motivoAnulacion && (
                <p className="text-sm mb-3 text-red-700">
                  <strong>Motivo de anulación:</strong>{" "}
                  {selectedFactura.motivoAnulacion}
                </p>
              )}

            {/* Pedidos asociados */}
            {(() => {
              const pedidosFactura = selectedFactura.pedidos ?? [];
              return pedidosFactura.length > 0 ? (
                <table className="w-full text-sm border mb-3">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Pedido ID</th>
                      <th className="p-2 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosFactura.map((p: PedidoReferencia, idx) => {
                      const pedidoId = p.pedidoId ?? p.id ?? idx + 1;
                      return (
                        <tr key={pedidoId} className="border-b">
                          <td className="p-2">{pedidoId}</td>
                          <td className="p-2">Q {p.total.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 italic">Sin pedidos asociados.</p>
              );
            })()}

            {/* Resumen contable */}
            <hr className="my-3" />
            <h4 className="font-semibold mb-1">Resumen contable</h4>
            <p className="text-sm">
              Subtotal: Q {resumen.subtotal.toFixed(2)}
            </p>
            <p className="text-sm">IVA (12%): Q {resumen.iva.toFixed(2)}</p>
            {resumen.descuento > 0 && (
              <p className="text-sm text-red-700">
                Descuento: Q {resumen.descuento.toFixed(2)}
              </p>
            )}
            <p className="text-sm font-semibold text-green-700">
              Total Final: Q {resumen.total.toFixed(2)}
            </p>

            <div className="text-right mt-4">
              <button
                onClick={() => setSelectedFactura(null)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
