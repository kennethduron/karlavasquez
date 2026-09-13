"use client";

import {
  CalendarDays,
  Bell,
  ChevronDown,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils/cn";

const activeItems = [
  { href: "/panel", label: "Resumen", icon: LayoutDashboard },
  { href: "/panel/seguridad", label: "Seguridad", icon: ShieldCheck },
];

const upcomingItems = [
  { label: "Consultas", icon: MessageSquareText },
  { label: "Clientes", icon: Users },
  { label: "Expedientes", icon: FolderKanban },
  { label: "Documentos", icon: FileText },
  { label: "Agenda", icon: CalendarDays },
];

export type ShellUser = {
  displayName: string;
  email: string;
  roleLabel: string;
};

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: ShellUser;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const currentLabel = activeItems.find(({ href }) =>
    href === "/panel" ? pathname === href : pathname.startsWith(href),
  )?.label;
  const initials = user.displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="crm-shell">
      <a className="skip-link" href="#contenido-principal">
        Saltar al contenido
      </a>
      <button
        className={cn("crm-scrim", open && "is-open")}
        aria-label="Cerrar navegación"
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn("crm-sidebar", open && "is-open")}
        aria-label="Barra lateral"
      >
        <div className="crm-brand">
          <span className="crm-brand-mark" aria-hidden="true">
            KNV
          </span>
          <span>
            <strong>Bufete Legal</strong>
            <small>Gestión privada</small>
          </span>
          <button
            className="crm-close"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="crm-nav" aria-label="Navegación principal">
          <p className="crm-nav-label">Espacio de trabajo</p>
          {activeItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/panel" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                className={cn("crm-nav-item", active && "is-active")}
                href={href}
                key={href}
                onClick={() => setOpen(false)}
              >
                <Icon size={19} />
                <span>{label}</span>
              </Link>
            );
          })}
          <p className="crm-nav-label mt-6">Módulos siguientes</p>
          {upcomingItems.map(({ label, icon: Icon }) => (
            <span
              className="crm-nav-item is-disabled"
              aria-disabled="true"
              key={label}
            >
              <Icon size={19} />
              <span>{label}</span>
              <small>Próx.</small>
            </span>
          ))}
        </nav>
        <p className="crm-sidebar-foot">
          Información confidencial · acceso auditado
        </p>
      </aside>
      <div className="crm-main-column">
        <header className="crm-topbar">
          <button
            className="crm-menu"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <div className="crm-topbar-context">
            <span className="eyebrow">KNV CRM</span>
            <nav aria-label="Migas de pan">
              <span>Panel</span>
              {currentLabel && currentLabel !== "Resumen" ? (
                <>
                  <span aria-hidden="true">/</span>
                  <strong>{currentLabel}</strong>
                </>
              ) : (
                <strong>Resumen</strong>
              )}
            </nav>
          </div>
          <button
            className="crm-notifications"
            type="button"
            aria-label="Notificaciones; disponible próximamente"
            disabled
          >
            <Bell size={19} />
          </button>
          <details className="crm-user-menu">
            <summary>
              <span className="crm-avatar">{initials || "KV"}</span>
              <span className="crm-user-copy">
                <strong>{user.displayName}</strong>
                <small>{user.roleLabel}</small>
              </span>
              <ChevronDown size={16} />
            </summary>
            <div className="crm-user-popover">
              <p>{user.email}</p>
              <Link href="/panel/seguridad">Seguridad de la cuenta</Link>
              <form action={logoutAction}>
                <button type="submit">
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </form>
            </div>
          </details>
        </header>
        {children}
      </div>
    </div>
  );
}
