// ✅ app/dashboard/usuarios/page.tsx
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

type UsuarioDTO = {
  id: number;
  username: string;
  rol: "ADMIN" | "USER";
  activo: boolean;
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const role =
      typeof window !== "undefined" ? localStorage.getItem("rol") : null;

    if (role !== "ADMIN") {
      setError("No tienes permisos para acceder a esta sección.");
      setUsuarios([]);
      return;
    }

    async function loadUsuarios() {
      try {
        setError("");
        const data = await apiFetch("/auth/usuarios");
        setUsuarios(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar usuarios");
      }
    }

    loadUsuarios();
  }, []);

  return (
    <section className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>

      {error && <p className="text-red-600">{error}</p>}

      {usuarios.length > 0 && !error && (
        <table className="w-full bg-white shadow rounded border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Usuario</th>
              <th className="p-2 border">Rol</th>
              <th className="p-2 border">Activo</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td className="p-2 border">{u.id}</td>
                <td className="p-2 border">{u.username}</td>
                <td className="p-2 border">{u.rol}</td>
                <td className="p-2 border">{u.activo ? "✅" : "❌"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!error && usuarios.length === 0 && (
        <p>No hay usuarios todavía.</p>
      )}
    </section>
  );
}
