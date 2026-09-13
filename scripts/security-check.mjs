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
if (packageJson.includes('"@supabase/')) {
  failures.push("Supabase remains an active runtime dependency.");
}

const authBlocker = read("firebase-functions/index.js");
if (
  !authBlocker.includes("beforeUserCreated") ||
  !authBlocker.includes("permission-denied")
) {
  failures.push(
    "Public Firebase Auth signup lacks a blocking beforeCreate hook.",
  );
}

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
  if (/from ["']@supabase\//.test(source))
    failures.push(`Supabase runtime import in ${displayPath}`);
  if (source.includes("NEXT_PUBLIC_FIREBASE_PRIVATE_KEY")) {
    failures.push(`Public Firebase private key variable in ${displayPath}`);
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

const sessionRoute = read("src/app/api/auth/session/route.ts");
for (const control of [
  "httpOnly: true",
  'sameSite: "lax"',
  "verifyIdToken(idToken, true)",
  "createSessionCookie",
]) {
  if (!sessionRoute.includes(control))
    failures.push(`Session control missing: ${control}`);
}

const firestoreRules = read("firestore.rules");
if (
  /match \/\{document=\*\*\}[^}]+allow read, write: if request\.auth != null/s.test(
    firestoreRules,
  )
) {
  failures.push("Firestore has a global authenticated-user allow rule.");
}
for (const control of [
  "match /auditLogs/{auditId}",
  "allow create, update, delete: if false",
  "match /counters/{counterId}",
  "hasPermission('cases.view')",
  "immutable(['humanId', 'clientId', 'createdAt', 'createdBy'])",
]) {
  if (!firestoreRules.includes(control))
    failures.push(`Firestore control missing: ${control}`);
}

const storageRules = read("storage.rules");
for (const control of [
  "private-legal-documents/{caseId}/{documentId}/{versionId}",
  "request.resource.size <= 25 * 1024 * 1024",
  "application/pdf",
  "allow update: if false",
]) {
  if (!storageRules.includes(control))
    failures.push(`Storage control missing: ${control}`);
}
if (/"hosting"\s*:/.test(read("firebase.json"))) {
  failures.push("Firebase Hosting is configured; Vercel is the active host.");
}

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

console.log("Firebase security foundation checks passed.");
