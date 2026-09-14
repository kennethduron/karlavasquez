import { ArrowRight, Check, Scale } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <p className="public-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy ? <p>{copy}</p> : null}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  copy,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  image?: { src: string; alt: string; position?: string };
  children?: ReactNode;
}) {
  const hasImage = Boolean(image);

  return (
    <section className={`page-hero${hasImage ? " page-hero--image" : ""}`}>
      {image ? (
        <div className="page-hero-background" aria-hidden="true">
          <Image
            src={image.src}
            alt=""
            fill
            preload
            sizes="100vw"
            style={{ objectPosition: image.position ?? "center" }}
          />
        </div>
      ) : null}
      <div className="site-container page-hero-grid">
        <div className="page-hero-content">
          <p className="public-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="page-hero-copy">{copy}</p>
          {children}
        </div>
        {!image ? (
          <div className="justice-motif" aria-hidden="true">
            <span className="justice-orbit justice-orbit--one" />
            <span className="justice-orbit justice-orbit--two" />
            <Scale size={82} strokeWidth={1.1} />
            <small>KNV</small>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function EditorialImage({
  src,
  alt,
  className = "",
  position = "center",
}: {
  src: string;
  alt: string;
  className?: string;
  position?: string;
}) {
  return (
    <div className={`editorial-media ${className}`.trim()}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) 48vw, 610px"
        style={{ objectPosition: position }}
      />
    </div>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="breadcrumbs site-container" aria-label="Migas de pan">
      <ol>
        <li>
          <Link href="/">Inicio</Link>
        </li>
        {items.map((item) => (
          <li key={item.label} aria-current={item.href ? undefined : "page"}>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              item.label
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function CheckList({ items }: { items: readonly string[] }) {
  return (
    <ul className="check-list">
      {items.map((item) => (
        <li key={item}>
          <Check aria-hidden="true" size={18} />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function FaqList({
  items,
}: {
  items: readonly { question: string; answer: string }[];
}) {
  return (
    <div className="faq-list">
      {items.map((item) => (
        <details key={item.question}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function CtaBand({
  title = "Conversemos sobre su situación",
  copy = "Dé el primer paso con una orientación clara, confidencial y responsable.",
}: {
  title?: string;
  copy?: string;
}) {
  return (
    <section className="cta-band">
      <div className="site-container cta-band-inner">
        <div>
          <p className="public-eyebrow">Orientación personalizada</p>
          <h2>{title}</h2>
          <p>{copy}</p>
        </div>
        <Link className="button button--cream" href="/solicitar-consulta">
          Solicitar consulta <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
