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
} from "../../lib/api";

export default function FacturasPage() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorId, setProveedorId] = useState<number | "">("");
  const [monto, setMonto] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [facs, provs] = await Promise.all([getFacturas(), getProveedores()]);
      setFacturas(facs);
      setProveedores(provs);
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (proveedorId === "") {
      setError("Selecciona un proveedor");
      return;
    }
    try {
      setError(null);
      await createFactura({
        proveedorId: Number(proveedorId),
        monto: monto === "" ? 0 : Number(monto),
      });
      setProveedorId("");
      setMonto("");
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error creando factura";
      setError(msg);
    }
  }

  // 🔍 Nuevo: obtener detalle dinámico desde backend
  async function verDetalleFactura(id: number) {
    try {
      const data = await getFacturaDetalle(id);
      setSelectedFactura(data);
    } catch (e: any) {
      alert(e.message || "Error cargando detalle de factura");
    }
  }

  // ❌ Anular factura con motivo
  async function handleAnularFactura(id: number) {
    const motivo = prompt("Motivo de anulación de la factura:");
    if (!motivo || motivo.trim() === "") return;

    try {
      const anulada = await anularFactura(id, motivo.trim());
      // actualizar listado
      setFacturas((prev) =>
        prev.map((f) => (f.id === id ? anulada : f))
      );
      // si está abierta en el modal, actualizarla también
      setSelectedFactura((prev) => (prev && prev.id === id ? anulada : prev));
    } catch (e: any) {
      alert(e.message || "Error al anular factura");
    }
  }

  // 🧮 Calcular resumen (subtotal, IVA y total)
  function calcularResumen(factura: Factura | null) {
    if (!factura) return { subtotal: 0, iva: 0, total: 0 };
    const subtotal = factura.pedidos && factura.pedidos.length > 0
      ? factura.pedidos.reduce((sum, p) => sum + p.total, 0)
      : factura.monto;
    const iva = subtotal * 0.12;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  }

  const resumen = calcularResumen(selectedFactura);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Facturas</h2>

      {/* ======= FORMULARIO ======= */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border p-4 rounded-lg shadow-sm space-y-4"
      >
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

        <div>
          <label htmlFor="monto" className="block text-sm mb-1">
            Monto manual (opcional)
          </label>
          <input
            id="monto"
            type="number"
            step="0.01"
            placeholder="Deja vacío para calcular automáticamente"
            className="border rounded p-2 w-full"
            value={monto}
            onChange={(e) =>
              setMonto(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>

        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Crear Factura
        </button>
        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
      </form>

      {/* ======= LISTADO ======= */}
      <div className="bg-white border p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold text-lg mb-3">Listado de facturas</h3>

        {loading && <p>Cargando...</p>}
        {!loading && facturas.length === 0 && (
          <p className="text-gray-500 italic">No hay facturas aún.</p>
        )}

        {!loading && facturas.length > 0 && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Proveedor</th>
                <th className="p-2 text-left">Monto total</th>
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-left">Tipo</th>
                <th className="p-2 text-left">Estado</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => (
                <tr key={f.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{f.id}</td>
                  <td className="p-2">
                    {proveedores.find((p) => p.id === f.proveedorId)?.nombre ||
                      f.proveedorId}
                  </td>
                  <td className="p-2">Q {f.monto?.toFixed(2)}</td>
                  <td className="p-2">
                    {f.fecha
                      ? new Date(f.fecha).toISOString().split("T")[0]
                      : "-"}
                  </td>
                  <td className="p-2">
                    {f.pedidos && f.pedidos.length > 0
                      ? "📜 Automática"
                      : "🧾 Manual"}
                  </td>
                  <td className="p-2">
                    <span
                      className={
                        f.estado === "ANULADA"
                          ? "text-red-600 font-semibold"
                          : "text-green-600 font-semibold"
                      }
                    >
                      {f.estado || "ACTIVA"}
                    </span>
                  </td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => verDetalleFactura(f.id!)}
                      className="text-blue-600 underline"
                    >
                      🔍 Ver detalle
                    </button>
                    {f.estado !== "ANULADA" && (
                      <button
                        onClick={() => handleAnularFactura(f.id!)}
                        className="text-red-600 underline"
                      >
                        ❌ Anular
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ======= MODAL DETALLES ======= */}
      {selectedFactura && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[480px] relative">
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
                ? new Date(selectedFactura.fecha)
                    .toISOString()
                    .split("T")[0]
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
                <p className="text-sm mb-3">
                  <strong>Motivo de anulación:</strong>{" "}
                  {selectedFactura.motivoAnulacion}
                </p>
              )}

            {selectedFactura.pedidos && selectedFactura.pedidos.length > 0 ? (
              <table className="w-full text-sm border mb-3">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Pedido ID</th>
                    <th className="p-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFactura.pedidos.map((p: PedidoReferencia, idx) => {
                    const pedidoId = p.pedidoId ?? p.id ?? idx + 1;
                    return (
                      <tr key={pedidoId} className="border-b">
                        <td className="p-2">{pedidoId}</td>
                        <td className="p-2">
                          Q {p.total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 italic">Sin pedidos asociados.</p>
            )}

            {/* Resumen contable */}
            <hr className="my-3" />
            <h4 className="font-semibold mb-1">Resumen</h4>
            <p className="text-sm">
              Subtotal: Q {resumen.subtotal.toFixed(2)}
            </p>
            <p className="text-sm">
              IVA (12%): Q {resumen.iva.toFixed(2)}
            </p>
            <p className="text-sm font-semibold">
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
