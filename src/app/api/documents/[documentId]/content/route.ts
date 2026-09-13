import { Readable } from "node:stream";
import { FirebaseAuditRepository } from "@/infrastructure/firebase/repositories/firebase-audit-repository";
import {
  FirebaseCaseRepository,
  FirebaseDocumentRepository,
} from "@/infrastructure/firebase/repositories/firebase-business-repositories";
import { getServerSession } from "@/lib/auth/session";
import {
  DocumentAccessError,
  PrivateDocumentService,
} from "@/services/private-document-service";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/documents/[documentId]/content">,
) {
  const session = await getServerSession();
  if (!session)
    return Response.json({ error: "No autorizado." }, { status: 401 });
  const { documentId } = await context.params;
  const requestId = crypto.randomUUID();

  try {
    const document = await new PrivateDocumentService(
      new FirebaseDocumentRepository(),
      new FirebaseCaseRepository(),
      new FirebaseAuditRepository(),
    ).open(session, documentId, requestId);
    return new Response(Readable.toWeb(document.stream) as ReadableStream, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Length": String(document.sizeBytes),
        "Cache-Control": "private, no-store",
        "Content-Disposition": "attachment",
        "X-Request-Id": requestId,
      },
    });
  } catch (error) {
    if (error instanceof DocumentAccessError) {
      return Response.json({ error: "Acceso denegado." }, { status: 403 });
    }
    return Response.json(
      { error: "Documento no disponible." },
      { status: 503 },
    );
  }
}
