import Link from "next/link";

import { Brand } from "@/components/public/brand";
import { practiceAreas } from "@/content/practice-areas";
import { siteConfig } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="public-footer">
      <div className="site-container footer-grid">
        <div className="footer-brand-block">
          <Brand inverse />
          <p>{siteConfig.slogan}</p>
        </div>
        <div>
          <h2>Navegación</h2>
          <ul>
            {siteConfig.navigation.slice(0, 5).map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Áreas</h2>
          <ul>
            {practiceAreas.map((area) => (
              <li key={area.slug}>
                <Link href={area.href}>{area.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Legal</h2>
          <ul>
            <li>
              <Link href="/privacidad">Política de privacidad</Link>
            </li>
            <li>
              <Link href="/aviso-legal">Aviso legal</Link>
            </li>
            <li>
              <Link href="/iniciar-sesion">Acceso interno</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="site-container footer-bottom">
        <p>
          © {new Date().getFullYear()} {siteConfig.professionalName} —{" "}
          {siteConfig.brandName}.
        </p>
        <p>
          Contenido informativo general. No constituye asesoría legal
          individual.
        </p>
      </div>
    </footer>
  );
}
