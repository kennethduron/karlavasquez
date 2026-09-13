import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const failures = [];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const gitignore = read(".gitignore");
if (!gitignore.includes(".env*"))
  failures.push("Environment files are not ignored.");
if (!gitignore.includes("!.env.example"))
  failures.push(".env.example is not tracked.");

const nextConfig = read("next.config.ts");
for (const header of [
  "Content-Security-Policy",
  "X-Content-Type-Options",
  "Referrer-Policy",
]) {
  if (!nextConfig.includes(header))
    failures.push(`Missing security header: ${header}`);
}

const sourceFiles = walk(join(root, "src")).filter((path) =>
  [".ts", ".tsx", ".js", ".mjs"].includes(extname(path)),
);
for (const file of sourceFiles) {
  const source = readFileSync(file, "utf8");
  const displayPath = relative(root, file);
  if (/\beval\s*\(/.test(source))
    failures.push(`Dangerous eval in ${displayPath}`);
  if (source.includes("dangerouslySetInnerHTML")) {
    failures.push(`Unreviewed raw HTML rendering in ${displayPath}`);
  }
  if (
    source.includes("SUPABASE_SERVICE_ROLE_KEY") &&
    !displayPath.endsWith(join("lib", "env", "server.ts")) &&
    !displayPath.endsWith(join("lib", "supabase", "admin.ts"))
  ) {
    failures.push(
      `Service role referenced outside server boundary: ${displayPath}`,
    );
  }
  if (source.includes("NEXT_PUBLIC_SUPABASE_SERVICE")) {
    failures.push(`Public service-role variable in ${displayPath}`);
  }
}

const schema = read("supabase/migrations/202609130001_initial_schema.sql");
const rls = read("supabase/migrations/202609130002_authorization_rls.sql");
const tables = [...schema.matchAll(/create table public\.([a-z_]+)/g)].map(
  ([, table]) => table,
);
for (const table of tables) {
  if (!rls.includes(`alter table public.${table} enable row level security;`)) {
    failures.push(`RLS is not enabled for public.${table}`);
  }
}
if (!rls.includes("'private-legal-documents',\n  false,")) {
  failures.push("Private legal document bucket is not explicitly private.");
}
if (
  /create policy [^\n]+ on public\.audit_logs for (update|delete)/i.test(rls)
) {
  failures.push("Audit logs expose a mutable RLS policy.");
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(
  `Security foundation checks passed (${tables.length} public tables with RLS).`,
);
