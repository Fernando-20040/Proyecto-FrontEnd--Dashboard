"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  HomeIcon,
  UserGroupIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getSession } from "@/app/lib/auth";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles: ("ADMIN" | "USER")[];
}

const allLinks: NavItem[] = [
  { name: "Inicio", href: "/dashboard", icon: HomeIcon, roles: ["ADMIN", "USER"] },
  { name: "Clientes", href: "/dashboard/clientes", icon: UserGroupIcon, roles: ["ADMIN"] },
  { name: "Pedidos", href: "/dashboard/pedidos", icon: ClipboardDocumentListIcon, roles: ["ADMIN", "USER"] },
  { name: "Proveedores", href: "/dashboard/proveedores", icon: BuildingStorefrontIcon, roles: ["ADMIN", "USER"] },
  { name: "Facturas", href: "/dashboard/facturas", icon: DocumentDuplicateIcon, roles: ["ADMIN", "USER"] },
  { name: "Usuarios", href: "/dashboard/usuarios", icon: UsersIcon, roles: ["ADMIN"] },
];

export default function NavLinks() {
  const pathname = usePathname();
  const [rol, setRol] = useState<"ADMIN" | "USER" | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Recuperar sesión de localStorage
    const session = getSession();
    if (session?.rol) {
      setRol(session.rol);
    }
    setReady(true);
  }, []);

  // ⚙️ Mientras no se haya cargado la sesión, no renderiza nada
  if (!ready) return null;

  // 🔍 Filtrar por rol
  const visibleLinks = rol
    ? allLinks.filter((link) => link.roles.includes(rol))
    : [];

  return (
    <>
      {visibleLinks.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
              {
                "bg-sky-100 text-blue-600": pathname === link.href,
              }
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
