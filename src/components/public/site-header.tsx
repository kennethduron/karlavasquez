"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Brand } from "@/components/public/brand";
import { HondurasTime } from "@/components/public/honduras-time";
import { siteConfig } from "@/content/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  return (
    <header className="public-header">
      <div className="public-utility-bar">
        <div className="public-utility-inner">
          <HondurasTime />
          <span className="public-utility-context">
            Atención jurídica en Honduras
          </span>
        </div>
      </div>
      <div className="public-header-inner">
        <Brand />
        <nav
          className="public-nav public-nav--desktop"
          aria-label="Navegación pública"
        >
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          className="button button--gold header-cta"
          href="/solicitar-consulta"
        >
          Solicitar consulta
        </Link>
        <button
          className="public-menu-button"
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      <div
        className={`public-mobile-panel${open ? " is-open" : ""}`}
        id="mobile-navigation"
      >
        <nav aria-label="Navegación móvil">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className="button button--gold"
            href="/solicitar-consulta"
            onClick={() => setOpen(false)}
          >
            Solicitar consulta
          </Link>
        </nav>
      </div>
    </header>
  );
}
