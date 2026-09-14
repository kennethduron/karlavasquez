"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { resourceCategories, resources } from "@/content/resources";

export function ResourceBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState<(typeof resourceCategories)[number]>("Todos");
  const filtered = useMemo(
    () =>
      resources.filter((resource) => {
        const matchesCategory =
          category === "Todos" || resource.category === category;
        const matchesQuery = `${resource.title} ${resource.excerpt}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [category, query],
  );

  return (
    <div className="resource-browser">
      <label className="resource-search">
        <Search aria-hidden="true" size={20} />
        <span className="sr-only">Buscar recursos</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por tema"
        />
      </label>
      <div className="filter-row" aria-label="Filtrar recursos">
        {resourceCategories.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="resource-grid" aria-live="polite">
        {filtered.map((resource) => (
          <article className="resource-card" key={resource.title}>
            <span>
              {resource.category} · {resource.readTime}
            </span>
            <h3>{resource.title}</h3>
            <p>{resource.excerpt}</p>
            <small>Artículo informativo en preparación</small>
          </article>
        ))}
        {filtered.length === 0 ? (
          <p className="empty-state">
            No hay recursos que coincidan con su búsqueda.
          </p>
        ) : null}
      </div>
    </div>
  );
}
