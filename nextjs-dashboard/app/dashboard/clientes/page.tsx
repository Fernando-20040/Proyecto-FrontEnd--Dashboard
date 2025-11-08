"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Cliente,
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  getClienteById,
} from "../../lib/api";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [detalleCliente, setDetalleCliente] = useState<Cliente | null>(null);

  // ====== CARGA DE CLIENTES ======
  async function loadClientes() {
    try {
      setLoading(true);
      setError(null);
      const data = await getClientes();
      setClientes(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error cargando clientes";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClientes();
  }, []);

  // ====== GUARDAR / ACTUALIZAR ======
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      setError(null);

      const payload = {
        nombre,
        correo,
        telefono: telefono || undefined,
        direccion: direccion || undefined,
      };

      if (editandoId) {
        await updateCliente(editandoId, payload);
        setEditandoId(null);
      } else {
        await createCliente(payload);
      }

      setNombre("");
      setCorreo("");
      setTelefono("");
      setDireccion("");
      await loadClientes();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error guardando cliente";
      setError(msg);
    }
  }

  // ====== EDITAR ======
  async function handleEdit(id: number) {
    const cliente = clientes.find((c) => c.id === id);
    if (cliente) {
      setEditandoId(id);
      setNombre(cliente.nombre);
      setCorreo(cliente.correo);
      setTelefono(cliente.telefono || "");
      setDireccion(cliente.direccion || "");
    }
  }

  // ====== ELIMINAR ======
  async function handleDelete(id: number) {
    if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;
    try {
      await deleteCliente(id);
      await loadClientes();
    } catch (err: any) {
      alert(err.message || "Error al eliminar cliente");
    }
  }

  // ====== DETALLE (MODAL) ======
  async function handleDetalle(id: number) {
    try {
      const data = await getClienteById(id);
      setDetalleCliente(data);
    } catch (err: any) {
      alert(err.message || "Error al obtener detalle del cliente");
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Clientes</h2>

      {/* ======= FORMULARIO ======= */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-lg p-4 space-y-4 shadow-sm"
      >
        <h3 className="font-semibold text-lg">
          {editandoId ? "Editar cliente" : "Nuevo cliente"}
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm mb-1">
              Nombre
            </label>
            <input
              id="nombre"
              className="w-full border rounded px-2 py-1"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          {/* Correo */}
          <div>
            <label htmlFor="correo" className="block text-sm mb-1">
              Correo
            </label>
            <input
              id="correo"
              type="email"
              className="w-full border rounded px-2 py-1"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block text-sm mb-1">
              Teléfono
            </label>
            <input
              id="telefono"
              type="text"
              className="w-full border rounded px-2 py-1"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Opcional"
            />
          </div>

          {/* Dirección */}
          <div>
            <label htmlFor="direccion" className="block text-sm mb-1">
              Dirección
            </label>
            <input
              id="direccion"
              type="text"
              className="w-full border rounded px-2 py-1"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            {editandoId ? "Actualizar" : "Guardar"}
          </button>
          {editandoId && (
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
              onClick={() => {
                setEditandoId(null);
                setNombre("");
                setCorreo("");
                setTelefono("");
                setDireccion("");
              }}
            >
              Cancelar
            </button>
          )}
        </div>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </form>

      {/* ======= LISTADO ======= */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-3">Listado de clientes</h3>
        {loading && <p>Cargando...</p>}
        {!loading && clientes.length === 0 && <p>No hay clientes aún.</p>}
        {!loading && clientes.length > 0 && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-2 text-sm">ID</th>
                <th className="text-left p-2 text-sm">Nombre</th>
                <th className="text-left p-2 text-sm">Correo</th>
                <th className="text-left p-2 text-sm">Teléfono</th>
                <th className="text-left p-2 text-sm">Dirección</th>
                <th className="text-left p-2 text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-sm">{c.id}</td>
                  <td className="p-2 text-sm">{c.nombre}</td>
                  <td className="p-2 text-sm">{c.correo}</td>
                  <td className="p-2 text-sm">{c.telefono || "—"}</td>
                  <td className="p-2 text-sm">{c.direccion || "—"}</td>
                  <td className="p-2 text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(c.id!)}
                      className="text-blue-600 hover:underline"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDetalle(c.id!)}
                      className="text-green-600 hover:underline"
                    >
                      🔍 Ver
                    </button>
                    <button
                      onClick={() => handleDelete(c.id!)}
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

      {/* ======= MODAL DETALLE ======= */}
      {detalleCliente && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button
              onClick={() => setDetalleCliente(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-600"
            >
              ✖
            </button>
            <h3 className="text-lg font-semibold mb-4">
              Detalle del cliente #{detalleCliente.id}
            </h3>
            <p>
              <strong>Nombre:</strong> {detalleCliente.nombre}
            </p>
            <p>
              <strong>Correo:</strong> {detalleCliente.correo}
            </p>
            <p>
              <strong>Teléfono:</strong>{" "}
              {detalleCliente.telefono || "—"}
            </p>
            <p>
              <strong>Dirección:</strong>{" "}
              {detalleCliente.direccion || "—"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
