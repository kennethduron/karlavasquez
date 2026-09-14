export const siteConfig = {
  professionalName: "Karla Norin Vásquez",
  brandName: "Bufete Legal",
  shortName: "KNV",
  slogan: "Asesoría Legal, honestidad, confiabilidad, precisión. Solución.",
  canonicalUrl: "https://bufetekarlavasquez.com",
  deploymentUrl: "https://bufetekarlavasquez.vercel.app",
  country: "Honduras",
  phone: null,
  whatsapp: null,
  email: null,
  address: null,
  hours: null,
  socials: null,
  navigation: [
    { label: "Inicio", href: "/" },
    { label: "Sobre Karla", href: "/sobre-karla" },
    { label: "Áreas de Práctica", href: "/areas-de-practica" },
    { label: "Servicios", href: "/servicios/divorcio" },
    { label: "Recursos", href: "/recursos" },
    { label: "Contacto", href: "/contacto" },
  ],
} as const;

export const publicRoutes = [
  "/",
  "/sobre-karla",
  "/areas-de-practica",
  "/areas-de-practica/derecho-de-familia",
  "/servicios/divorcio",
  "/solicitar-consulta",
  "/recursos",
  "/contacto",
  "/privacidad",
  "/aviso-legal",
] as const;

export type PublicRoute = (typeof publicRoutes)[number];
