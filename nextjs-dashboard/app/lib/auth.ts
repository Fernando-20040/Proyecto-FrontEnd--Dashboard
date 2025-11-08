// app/lib/auth.ts

export interface UserSession {
  token: string;
  username: string;
  rol: "ADMIN" | "USER";
}

// ✅ URL base del backend
const API_AUTH: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084";

// ✅ Función de login
// app/lib/auth.ts
export async function login(username: string, password: string): Promise<UserSession> {
  const res = await fetch(`${API_AUTH}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Error login backend:", res.status, text);
    throw new Error(text || "Credenciales inválidas");
  }

  const data = await res.json();

  const session: UserSession = {
    token: data.token,
    username: data.username,
    rol: data.rol as "ADMIN" | "USER",
  };

  saveSession(session);
  return session; // 👈 ya no redirige aquí
}

// ✅ Guardar sesión en localStorage
export function saveSession(data: UserSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", data.token);
  localStorage.setItem("username", data.username);
  localStorage.setItem("rol", data.rol);
}

// ✅ Obtener sesión almacenada
export function getSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const rol = localStorage.getItem("rol") as "ADMIN" | "USER" | null;
  if (!token || !username || !rol) return null;
  return { token, username, rol };
}

// ✅ Cerrar sesión
export function logout() {
  if (typeof window === "undefined") return;
  localStorage.clear();
  window.location.href = "/login";
}
