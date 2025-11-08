// ✅ app/ui/dashboard/sidenav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AcmeLogo from "@/app/ui/acme-logo";
import { PowerIcon, UserIcon, ClipboardDocumentListIcon, BuildingOffice2Icon, DocumentDuplicateIcon, UsersIcon, HomeIcon } from "@heroicons/react/24/outline";
import { logout, getSession } from "../../lib/auth";
import { useEffect, useState } from "react";

interface LinkItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const links: LinkItem[] = [
  { name: "Inicio", href: "/dashboard", icon: HomeIcon },
  { name: "Clientes", href: "/dashboard/clientes", icon: UsersIcon },
  { name: "Pedidos", href: "/dashboard/pedidos", icon: ClipboardDocumentListIcon },
  { name: "Proveedores", href: "/dashboard/proveedores", icon: BuildingOffice2Icon },
  { name: "Facturas", href: "/dashboard/facturas", icon: DocumentDuplicateIcon },
  { name: "Usuarios", href: "/dashboard/usuarios", icon: UserIcon },
];

export default function SideNav() {
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (session?.username) setUsername(session.username);
  }, []);

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2 bg-white shadow-md">
      {/* Logo superior */}
      <Link
        className="mb-4 flex h-20 items-center justify-start rounded-md bg-blue-600 p-4 md:h-24"
        href="/dashboard"
      >
        <div className="w-32 text-white md:w-40">
          <AcmeLogo />
        </div>
      </Link>

      {/* Navegación lateral */}
      <nav className="flex grow flex-col space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
              }`}
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Línea divisoria */}
      <div className="my-3 border-t border-gray-200" />

      {/* Usuario y Logout */}
      <div className="mt-auto flex flex-col space-y-2">
        {username && (
          <p className="text-sm text-gray-600 text-center mb-1">
            Sesión: <span className="font-semibold text-blue-600">{username}</span>
          </p>
        )}
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-red-100 hover:text-red-600 transition md:justify-start md:px-3"
        >
          <PowerIcon className="w-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
