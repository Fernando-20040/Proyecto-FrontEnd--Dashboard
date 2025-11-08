"use client";

import { useEffect, useState } from "react";
import { getSession, logout } from "@/app/lib/auth";
import { PowerIcon } from "@heroicons/react/24/solid";

export default function DashboardHeader() {
  const [username, setUsername] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    setUsername(session?.username || null);
    setRol(session?.rol || null);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white shadow-sm rounded-md mb-6 border border-gray-100">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">
          👋 Hola,{" "}
          <span className="text-blue-600 font-bold">
            {username || "Invitado"}
          </span>
        </h1>
        <p className="text-sm text-gray-500">
          Rol actual:{" "}
          <span
            className={`font-medium ${
              rol === "ADMIN" ? "text-red-500" : "text-green-600"
            }`}
          >
            {rol || "Sin rol"}
          </span>
        </p>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-all"
      >
        <PowerIcon className="w-5" />
        <span>Cerrar sesión</span>
      </button>
    </header>
  );
}
