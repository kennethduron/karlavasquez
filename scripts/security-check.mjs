import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const failures = [];
const read = (path) => readFileSync(join(root, path), "utf8");
const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });

const gitignore = read(".gitignore");
if (!gitignore.includes(".env*"))
  failures.push("Environment files are not ignored.");
if (!gitignore.includes("!.env.example"))
  failures.push(".env.example is not tracked.");

const packageJson = read("package.json");
if (!packageJson.includes('"@supabase/ssr"'))
  failures.push("Supabase SSR is not an active runtime dependency.");

for (const forbiddenPublicSecret of [
  "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_SECRET_KEY",
  "NEXT_PUBLIC_CLOUDINARY_API_SECRET",
  "NEXT_PUBLIC_B2_APPLICATION_KEY",
  "NEXT_PUBLIC_RESEND_API_KEY",
  "NEXT_PUBLIC_FIREBASE_PRIVATE_KEY",
]) {
  if (packageJson.includes(forbiddenPublicSecret)) {
    failures.push(`Forbidden public secret name: ${forbiddenPublicSecret}`);
  }
}

if (existsSync(join(root, "firebase-functions")))
  failures.push("Cloud Functions must not be configured on the Spark plan.");

const sourceFiles = walk(join(root, "src")).filter((path) =>
  [".ts", ".tsx", ".js", ".mjs"].includes(extname(path)),
);
for (const file of sourceFiles) {
  const source = readFileSync(file, "utf8");
  const displayPath = relative(root, file);
  if (/\beval\s*\(/.test(source))
    failures.push(`Dangerous eval in ${displayPath}`);
  if (source.includes("dangerouslySetInnerHTML"))
    failures.push(`Raw HTML in ${displayPath}`);
  if (
    /from ["']firebase\/(?:auth|firestore|database|storage)["']/.test(source) ||
    /from ["']firebase-admin\/(?:auth|firestore|database|storage)["']/.test(
      source,
    )
  ) {
    failures.push(`Non-FCM Firebase runtime import in ${displayPath}`);
  }
  if (
    /NEXT_PUBLIC_(?:FIREBASE_PRIVATE_KEY|SUPABASE_(?:SERVICE_ROLE|SECRET)_KEY|CLOUDINARY_API_SECRET|B2_APPLICATION_KEY|RESEND_API_KEY)/.test(
      source,
    )
  ) {
    failures.push(`Public secret variable in ${displayPath}`);
  }
}

const publicPhaseTwoFiles = [
  ...walk(join(root, "src", "app", "(public)")),
  ...walk(join(root, "src", "components", "public")),
].filter((path) => [".ts", ".tsx", ".js", ".mjs"].includes(extname(path)));
for (const file of publicPhaseTwoFiles) {
  const source = readFileSync(file, "utf8");
  const displayPath = relative(root, file);
  if (
    /firebase\/(firestore|database|storage)|@\/infrastructure\/firebase/.test(
      source,
    )
  ) {
    failures.push(
      `Firebase runtime access in Phase 2 public UI: ${displayPath}`,
    );
  }
  if (/\b(addDoc|setDoc|updateDoc|deleteDoc|writeBatch)\s*\(/.test(source)) {
    failures.push(`Persistence call in Phase 2 public UI: ${displayPath}`);
  }
}

for (const domainFile of walk(join(root, "src", "domain"))) {
  const source = readFileSync(domainFile, "utf8");
  if (/firebase|DocumentSnapshot|DocumentReference|Timestamp/.test(source)) {
    failures.push(
      `Firebase type leaked into domain: ${relative(root, domainFile)}`,
    );
  }
}

const admin = read("src/infrastructure/firebase/admin.ts");
if (!admin.startsWith('import "server-only";'))
  failures.push("Firebase Admin is not server-only.");
if (!admin.includes("getApps().length"))
  failures.push("Firebase Admin can initialize duplicate apps.");
if (/firebase-admin\/storage|getAdminStorage/.test(admin))
  failures.push("Firebase Storage is active despite the Spark-only policy.");

const supabaseServer = read("src/infrastructure/supabase/server.ts");
for (const control of [
  "httpOnly: true",
  'sameSite: "lax"',
  "environment.publishableKey",
  "environment.secretKey",
]) {
  if (!supabaseServer.includes(control))
    failures.push(`Supabase server control missing: ${control}`);
}

for (const retiredFirebaseFile of [
  "firebase.json",
  "firestore.rules",
  "firestore.indexes.json",
]) {
  if (existsSync(join(root, retiredFirebaseFile))) {
    failures.push(
      `Retired Firebase runtime file remains: ${retiredFirebaseFile}`,
    );
  }
}
if (existsSync(join(root, "storage.rules")))
  failures.push("Active Storage Rules must be absent on Spark.");
if (
  existsSync(
    join(
      root,
      "src",
      "app",
      "api",
      "documents",
      "[documentId]",
      "content",
      "route.ts",
    ),
  )
)
  failures.push("Binary document endpoint must be deferred on Spark.");

for (const migration of [
  "202609130001_initial_schema.sql",
  "202609130002_authorization_rls.sql",
  "202609130003_reference_data.sql",
]) {
  if (!existsSync(join(root, "supabase", "migrations", migration))) {
    failures.push(`Future Supabase reference was removed: ${migration}`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Phase 2.4B Supabase and FCM-only security checks passed.");
