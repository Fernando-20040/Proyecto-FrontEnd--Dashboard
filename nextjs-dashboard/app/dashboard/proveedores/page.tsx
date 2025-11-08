"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Proveedor,
  getProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from "../../lib/api";

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getProveedores();
      setProveedores(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error cargando proveedores";
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
    try {
      // Validar formato de correo
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        setError("El correo no tiene un formato válido");
        return;
      }

      const payload: Proveedor = {
        nombre,
        correo,
        telefono: telefono || undefined,
        direccion: direccion || undefined,
      };

      if (editandoId) {
        await updateProveedor(editandoId, payload);
        setEditandoId(null);
      } else {
        await createProveedor(payload);
      }

      setNombre("");
      setCorreo("");
      setTelefono("");
      setDireccion("");
      setError(null);
      await load();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error guardando proveedor";
      setError(msg);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este proveedor?")) return;
    try {
      await deleteProveedor(id);
      await load();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error eliminando proveedor";
      alert(msg);
    }
  }

  function handleEdit(id: number) {
    const p = proveedores.find((x) => x.id === id);
    if (p) {
      setEditandoId(id);
      setNombre(p.nombre);
      setCorreo(p.correo);
      setTelefono(p.telefono || "");
      setDireccion(p.direccion || "");
      setError(null);
    }
  }

  function resetForm() {
    setEditandoId(null);
    setNombre("");
    setCorreo("");
    setTelefono("");
    setDireccion("");
    setError(null);
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Proveedores</h2>

      {/* ======= FORMULARIO ======= */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border p-4 rounded-lg shadow-sm space-y-4"
      >
        <h3 className="font-semibold text-lg">
          {editandoId ? "Editar proveedor" : "Nuevo proveedor"}
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombre" className="block text-sm mb-1">
              Nombre
            </label>
            <input
              id="nombre"
              className="border rounded p-2 w-full"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (error) setError(null);
              }}
              required
            />
          </div>

          <div>
            <label htmlFor="correo" className="block text-sm mb-1">
              Correo
            </label>
            <input
              id="correo"
              type="email"
              className="border rounded p-2 w-full"
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                if (error) setError(null);
              }}
              required
            />
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm mb-1">
              Teléfono (opcional)
            </label>
            <input
              id="telefono"
              className="border rounded p-2 w-full"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>

          <div className="md:col-span-1">
            <label htmlFor="direccion" className="block text-sm mb-1">
              Dirección (opcional)
            </label>
            <input
              id="direccion"
              className="border rounded p-2 w-full"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300"
            disabled={loading}
          >
            {loading
              ? "Guardando..."
              : editandoId
              ? "Actualizar"
              : "Guardar"}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          )}
        </div>
        {error && <p className="text-red-600">{error}</p>}
      </form>

      {/* ======= LISTADO ======= */}
      <div className="bg-white border p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold text-lg mb-3">
          Listado de proveedores
        </h3>

        {loading && <p>Cargando...</p>}
        {!loading && proveedores.length === 0 && <p>No hay proveedores.</p>}

        {!loading && proveedores.length > 0 && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-left">Correo</th>
                <th className="p-2 text-left">Teléfono</th>
                <th className="p-2 text-left">Dirección</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{p.id}</td>
                  <td className="p-2">{p.nombre}</td>
                  <td className="p-2">{p.correo}</td>
                  <td className="p-2">{p.telefono || "—"}</td>
                  <td className="p-2">{p.direccion || "—"}</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => handleEdit(p.id!)}
                      className="text-blue-600 hover:underline"
                    >
                      ✏️ Editar
                    </button>
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
