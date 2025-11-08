// app/ui/login-form.tsx
"use client";

import { FormEvent, useState } from "react";
import { login } from "../lib/auth";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("admin"); // opcional, para pruebas
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await login(username, password); // llama a /auth/login backend
      // Redirigir según rol
      if (session.rol === "ADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/dashboard/pedidos");
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg bg-white p-6 shadow-md"
    >
      <h1 className="text-xl font-semibold text-center">Iniciar sesión</h1>

      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1">
          Usuario
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="Tu usuario"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="••••••••"
          required
        />
      </div>

      {error && (
        <p className="text-sm text-center text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
        disabled={loading}
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
