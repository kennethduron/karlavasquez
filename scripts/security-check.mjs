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
  if (/from ["']@supabase\//.test(source))
    failures.push(`Supabase runtime import in ${displayPath}`);
  if (source.includes("NEXT_PUBLIC_FIREBASE_PRIVATE_KEY")) {
    failures.push(`Public Firebase private key variable in ${displayPath}`);
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

const firebaseConfig = read("firebase.json");
if (/"hosting"\s*:/.test(firebaseConfig)) {
  failures.push("Firebase Hosting is configured; Vercel is the active host.");
}
if (/"storage"\s*:|"functions"\s*:/.test(firebaseConfig))
  failures.push("Paid Firebase Storage or Functions is configured.");
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

console.log("Firebase security foundation checks passed.");
