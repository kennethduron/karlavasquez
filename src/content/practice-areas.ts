import {
  BriefcaseBusiness,
  FileSignature,
  Landmark,
  Scale,
  UsersRound,
} from "lucide-react";

export const practiceAreas = [
  {
    slug: "derecho-de-familia",
    name: "Derecho de Familia",
    summary:
      "Orientación responsable para asuntos familiares que requieren sensibilidad, claridad y absoluta confidencialidad.",
    services: [
      "Matrimonio",
      "Divorcio",
      "Suspensión de patria potestad",
      "Demandas de alimentos",
      "Régimen de comunicación",
      "Otros asuntos familiares",
    ],
    icon: UsersRound,
    href: "/areas-de-practica/derecho-de-familia",
  },
  {
    slug: "derecho-civil",
    name: "Derecho Civil",
    summary:
      "Acompañamiento jurídico en asuntos patrimoniales, hereditarios y controversias civiles.",
    services: [
      "Demandas de pago extrajudicial",
      "Declaratoria de herencias",
      "Reivindicación de dominio",
      "Cesación de comunidad de bienes",
      "Prescripción adquisitiva de posesión sobre terreno",
      "Otros asuntos civiles",
    ],
    icon: Landmark,
    href: "/solicitar-consulta",
  },
  {
    slug: "derecho-penal",
    name: "Derecho Penal",
    summary:
      "Defensa privada con atención diligente, comunicación clara y respeto por las garantías de cada persona.",
    services: ["Defensa privada"],
    icon: Scale,
    href: "/solicitar-consulta",
  },
  {
    slug: "derecho-mercantil",
    name: "Derecho Mercantil",
    summary:
      "Asistencia profesional para la representación jurídica de sociedades.",
    services: ["Representaciones de sociedades"],
    icon: BriefcaseBusiness,
    href: "/solicitar-consulta",
  },
  {
    slug: "derecho-notarial",
    name: "Derecho Notarial",
    summary:
      "Preparación y formalización cuidadosa de actos y documentos notariales.",
    services: [
      "Escrituras de traspaso de dominio",
      "Comerciante individual",
      "Sociedades civiles",
      "Sociedades mercantiles",
      "Poderes",
      "Traspaso de propietario de vehículos",
      "Testamentos",
      "Autorización de salida del país",
      "Autorización para emisión de pasaporte",
      "Otros actos notariales",
    ],
    icon: FileSignature,
    href: "/solicitar-consulta",
  },
] as const;
