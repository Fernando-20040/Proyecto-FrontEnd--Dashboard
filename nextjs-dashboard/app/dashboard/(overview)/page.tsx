// ✅ app/dashboard/(overview)/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getClientes,
  getPedidos,
  getProveedores,
  getFacturas,
} from "../../lib/api";

export default function DashboardPage() {
  const [clientes, setClientes] = useState(0);
  const [pedidos, setPedidos] = useState(0);
  const [proveedores, setProveedores] = useState(0);
  const [facturas, setFacturas] = useState(0);
  const [username, setUsername] = useState("Usuario");

  useEffect(() => {
    const storedUser =
      typeof window !== "undefined" ? localStorage.getItem("username") : null;
    if (storedUser) setUsername(storedUser);

    async function load() {
      try {
        const [c, p, pr, f] = await Promise.all([
          getClientes(),
          getPedidos(),
          getProveedores(),
          getFacturas(),
        ]);
        setClientes(c.length);
        setPedidos(p.length);
        setProveedores(pr.length);
        setFacturas(f.length);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <main className="p-6 md:p-12 space-y-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-2">
        Bienvenido, {username}
      </h1>
      <p className="text-gray-600 mb-6">Panel de control — MultiPedidos</p>

      {/* 🔹 Tarjetas resumen */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-gray-500">Clientes</h3>
          <p className="text-4xl font-bold text-blue-600">{clientes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-gray-500">Pedidos</h3>
          <p className="text-4xl font-bold text-green-600">{pedidos}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-gray-500">Proveedores</h3>
          <p className="text-4xl font-bold text-purple-600">{proveedores}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-gray-500">Facturas</h3>
          <p className="text-4xl font-bold text-red-600">{facturas}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-700">
          Este dashboard muestra el resumen de entidades provenientes de los dos
          microservicios:
        </p>
        <ul className="list-disc pl-6 text-gray-700 mt-2">
          <li>Clientes y Pedidos (MariaDB - Componente A)</li>
          <li>Proveedores y Facturas (PostgreSQL - Componente B)</li>
        </ul>
      </div>
    </main>
  );
}
