// ✅ app/ui/components/session-provider.tsx
"use client";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ya no usamos next-auth; devolvemos los children directamente
  return <>{children}</>;
}
