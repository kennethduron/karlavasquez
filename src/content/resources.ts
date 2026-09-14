export const resourceCategories = [
  "Todos",
  "Preparación",
  "Familia",
  "Civil",
  "Notarial",
] as const;

export const resources = [
  {
    title: "Cómo prepararse para una consulta jurídica",
    category: "Preparación",
    excerpt:
      "Una guía general para ordenar sus preguntas, fechas y documentos antes de conversar con una profesional.",
    featured: true,
    readTime: "5 min",
  },
  {
    title: "Información general sobre herencias",
    category: "Civil",
    excerpt:
      "Conceptos introductorios que pueden ayudarle a identificar la orientación que necesita para su situación.",
    featured: false,
    readTime: "6 min",
  },
  {
    title: "Recursos notariales: antes de comenzar",
    category: "Notarial",
    excerpt:
      "Preguntas útiles para preparar una conversación sobre escrituras, poderes y otros actos notariales.",
    featured: false,
    readTime: "4 min",
  },
  {
    title: "Conversaciones familiares con mayor claridad",
    category: "Familia",
    excerpt:
      "Recomendaciones generales para organizar información sensible antes de solicitar orientación jurídica.",
    featured: false,
    readTime: "5 min",
  },
] as const;
