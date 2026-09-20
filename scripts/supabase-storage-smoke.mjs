import { createClient } from "@supabase/supabase-js";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing required variable: ${name}`);
}

const bucket = "legal-documents";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const admin = createClient(url, process.env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const createUserClient = () =>
  createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

const password = `St0rage-${crypto.randomUUID()}!aA`;
const userIds = new Set();
const objectPaths = new Set();
const cleanupIds = {};
let stage = "bucket-configuration";
let failure;
let results;

async function createIdentity(label, roleKey, orphan = false) {
  const email = `phase-2-4b-storage-${label}-${crypto.randomUUID()}@example.invalid`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: `Storage ${label}` },
  });
  if (error || !data.user) throw error ?? new Error("Identity creation failed");
  userIds.add(data.user.id);

  if (orphan) {
    const { error: deleteProfileError } = await admin
      .from("profiles")
      .delete()
      .eq("id", data.user.id);
    if (deleteProfileError) throw deleteProfileError;
  } else {
    const { error: profileError } = await admin
      .from("profiles")
      .update({ status: "active" })
      .eq("id", data.user.id);
    if (profileError) throw profileError;
    const { data: role, error: roleError } = await admin
      .from("roles")
      .select("id")
      .eq("key", roleKey)
      .single();
    if (roleError) throw roleError;
    const { error: membershipError } = await admin
      .from("user_roles")
      .insert({ user_id: data.user.id, role_id: role.id });
    if (membershipError) throw membershipError;
  }

  const client = createUserClient();
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) throw signInError;
  return { client, email, userId: data.user.id };
}

async function cleanup() {
  if (objectPaths.size) {
    await admin.storage.from(bucket).remove([...objectPaths]);
  }
  if (cleanupIds.versionIds?.length) {
    await admin
      .from("document_versions")
      .delete()
      .in("id", cleanupIds.versionIds);
  }
  if (cleanupIds.documentId) {
    await admin.from("documents").delete().eq("id", cleanupIds.documentId);
  }
  if (cleanupIds.caseId) {
    await admin
      .from("case_assignments")
      .delete()
      .eq("case_id", cleanupIds.caseId);
    await admin.from("cases").delete().eq("id", cleanupIds.caseId);
  }
  if (cleanupIds.clientId) {
    await admin.from("clients").delete().eq("id", cleanupIds.clientId);
  }
  for (const userId of userIds) {
    await admin.from("profiles").delete().eq("id", userId);
    await admin.auth.admin.deleteUser(userId);
  }
}

try {
  const { data: bucketData, error: bucketError } =
    await admin.storage.getBucket(bucket);
  if (bucketError || !bucketData) {
    throw bucketError ?? new Error("Private bucket is unavailable");
  }
  if (bucketData.public || bucketData.file_size_limit !== 26_214_400) {
    throw new Error("Private bucket configuration mismatch");
  }
  const allowedTypes = new Set(bucketData.allowed_mime_types ?? []);
  for (const mime of [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/webp",
  ]) {
    if (!allowedTypes.has(mime))
      throw new Error("Allowed MIME configuration mismatch");
  }

  stage = "identity-fixtures";
  const owner = await createIdentity("owner", "administrator");
  const lawyer = await createIdentity("lawyer", "lawyer");
  const orphan = await createIdentity("orphan", undefined, true);

  stage = "metadata-fixtures";
  const [
    { data: practiceArea, error: practiceAreaError },
    { data: caseStatus, error: caseStatusError },
  ] = await Promise.all([
    admin
      .from("practice_areas")
      .select("id")
      .eq("is_active", true)
      .limit(1)
      .single(),
    admin.from("case_statuses").select("id").eq("key", "active").single(),
  ]);
  if (practiceAreaError || caseStatusError) {
    throw practiceAreaError ?? caseStatusError;
  }

  const suffix = crypto.randomUUID().slice(0, 8);
  const clientId = crypto.randomUUID();
  const caseId = crypto.randomUUID();
  const documentId = crypto.randomUUID();
  const versionId = crypto.randomUUID();
  const unauthorizedVersionId = crypto.randomUUID();
  cleanupIds.clientId = clientId;
  cleanupIds.caseId = caseId;
  cleanupIds.documentId = documentId;
  cleanupIds.versionIds = [versionId, unauthorizedVersionId];

  const { error: clientError } = await admin.from("clients").insert({
    id: clientId,
    human_id: `CLI-2026-${suffix}`,
    display_name: "Cliente sintético Gate D",
    search_name: "cliente sintetico gate d",
    responsible_user_id: owner.userId,
  });
  if (clientError) throw clientError;

  const { error: caseError } = await admin.from("cases").insert({
    id: caseId,
    human_id: `KNV-2026-${suffix}`,
    client_id: clientId,
    practice_area_id: practiceArea.id,
    title: "Expediente sintético Gate D",
    status_id: caseStatus.id,
    responsible_user_id: owner.userId,
  });
  if (caseError) throw caseError;

  const path = `cases/${caseId}/documents/${documentId}/${versionId}-gate-d.pdf`;
  const unauthorizedPath = `cases/${caseId}/documents/${documentId}/${unauthorizedVersionId}-gate-d.pdf`;
  objectPaths.add(path);
  objectPaths.add(unauthorizedPath);
  const content = new TextEncoder().encode(
    "%PDF-1.4\n% KNV Gate D synthetic\n%%EOF",
  );

  const { error: documentError } = await admin.from("documents").insert({
    id: documentId,
    client_id: clientId,
    case_id: caseId,
    title: "Documento sintético Gate D",
    uploaded_by: owner.userId,
  });
  if (documentError) throw documentError;
  const { error: versionsError } = await admin
    .from("document_versions")
    .insert([
      {
        id: versionId,
        document_id: documentId,
        version_number: 1,
        storage_path: path,
        original_filename: "gate-d.pdf",
        mime_type: "application/pdf",
        size_bytes: content.byteLength,
        uploaded_by: owner.userId,
      },
      {
        id: unauthorizedVersionId,
        document_id: documentId,
        version_number: 2,
        storage_path: unauthorizedPath,
        original_filename: "gate-d.pdf",
        mime_type: "application/pdf",
        size_bytes: content.byteLength,
        uploaded_by: lawyer.userId,
      },
    ]);
  if (versionsError) throw versionsError;

  stage = "authorized-upload";
  const { error: uploadError } = await owner.client.storage
    .from(bucket)
    .upload(path, content, { contentType: "application/pdf", upsert: false });
  if (uploadError) throw uploadError;

  stage = "mime-restriction";
  const invalidPath = `cases/${caseId}/documents/${documentId}/${crypto.randomUUID()}-gate-d.txt`;
  const { error: invalidMimeError } = await owner.client.storage
    .from(bucket)
    .upload(invalidPath, new TextEncoder().encode("synthetic"), {
      contentType: "text/plain",
      upsert: false,
    });
  if (!invalidMimeError) {
    objectPaths.add(invalidPath);
    throw new Error("Disallowed MIME upload succeeded");
  }

  stage = "authorized-download";
  const { data: downloaded, error: downloadError } = await owner.client.storage
    .from(bucket)
    .download(path);
  if (downloadError || !downloaded) {
    throw downloadError ?? new Error("Authorized download failed");
  }
  if ((await downloaded.arrayBuffer()).byteLength !== content.byteLength) {
    throw new Error("Downloaded content size mismatch");
  }
  const { data: signedUrl, error: signedUrlError } = await owner.client.storage
    .from(bucket)
    .createSignedUrl(path, 60);
  if (signedUrlError || !signedUrl?.signedUrl) {
    throw signedUrlError ?? new Error("Authorized signed URL failed");
  }

  stage = "anonymous-denial";
  const anonymous = createUserClient();
  const { error: anonymousDownloadError } = await anonymous.storage
    .from(bucket)
    .download(path);
  if (!anonymousDownloadError) throw new Error("Anonymous download succeeded");

  stage = "orphan-denial";
  const { error: orphanDownloadError } = await orphan.client.storage
    .from(bucket)
    .download(path);
  if (!orphanDownloadError) throw new Error("Orphan download succeeded");

  stage = "unauthorized-download-denial";
  const { error: lawyerDownloadError } = await lawyer.client.storage
    .from(bucket)
    .download(path);
  if (!lawyerDownloadError)
    throw new Error("Unassigned lawyer download succeeded");
  stage = "unauthorized-signed-url-denial";
  const { error: lawyerSignedUrlError } = await lawyer.client.storage
    .from(bucket)
    .createSignedUrl(path, 60);
  if (!lawyerSignedUrlError)
    throw new Error("Unassigned lawyer signed URL succeeded");
  stage = "unauthorized-upload-denial";
  const { error: lawyerUploadError } = await lawyer.client.storage
    .from(bucket)
    .upload(unauthorizedPath, content, {
      contentType: "application/pdf",
      upsert: false,
    });
  if (!lawyerUploadError) throw new Error("Unassigned lawyer upload succeeded");
  stage = "unauthorized-delete-denial";
  const { data: lawyerDeleteData, error: lawyerDeleteError } =
    await lawyer.client.storage.from(bucket).remove([path]);
  if (!lawyerDeleteError && lawyerDeleteData.length > 0) {
    throw new Error("Unassigned lawyer delete succeeded");
  }
  const {
    data: objectAfterDeniedDelete,
    error: deniedDeleteVerificationError,
  } = await owner.client.storage.from(bucket).download(path);
  if (deniedDeleteVerificationError || !objectAfterDeniedDelete) {
    throw new Error("Denied delete removed the protected object");
  }

  stage = "assignment-create";
  const { error: assignmentError } = await admin
    .from("case_assignments")
    .insert({
      case_id: caseId,
      user_id: lawyer.userId,
      assignment_role: "collaborator",
      assigned_by: owner.userId,
    });
  if (assignmentError) throw assignmentError;
  stage = "assignment-grants-download";
  const { data: assignedDownload, error: assignedDownloadError } =
    await lawyer.client.storage.from(bucket).download(path);
  if (assignedDownloadError || !assignedDownload) {
    throw assignedDownloadError ?? new Error("Assigned lawyer download failed");
  }
  stage = "assignment-end";
  const { error: endAssignmentError } = await admin
    .from("case_assignments")
    .update({ ended_at: new Date().toISOString() })
    .eq("case_id", caseId)
    .eq("user_id", lawyer.userId);
  if (endAssignmentError) throw endAssignmentError;
  const { data: endedAssignment, error: endedAssignmentError } = await admin
    .from("case_assignments")
    .select("ended_at")
    .eq("case_id", caseId)
    .eq("user_id", lawyer.userId)
    .single();
  if (endedAssignmentError || !endedAssignment.ended_at) {
    throw endedAssignmentError ?? new Error("Assignment end was not persisted");
  }
  stage = "assignment-revokes-download";
  await lawyer.client.auth.signOut({ scope: "local" });
  const postAssignmentClient = createUserClient();
  const { error: postAssignmentLoginError } =
    await postAssignmentClient.auth.signInWithPassword({
      email: lawyer.email,
      password,
    });
  if (postAssignmentLoginError) throw postAssignmentLoginError;
  const { error: postAssignmentDownloadError } =
    await postAssignmentClient.storage.from(bucket).download(path);
  if (!postAssignmentDownloadError) {
    throw new Error("Ended assignment retained document access");
  }

  stage = "authorized-delete";
  const { data: deleteData, error: deleteError } = await owner.client.storage
    .from(bucket)
    .remove([path]);
  if (deleteError || deleteData.length !== 1) {
    throw deleteError ?? new Error("Authorized delete failed");
  }
  objectPaths.delete(path);

  results = {
    status: "PASS",
    bucketPrivate: true,
    sizeLimit25MiB: true,
    mimeAllowlist: true,
    authorizedUpload: true,
    authorizedDownload: true,
    signedUrl: true,
    anonymousDenied: true,
    orphanDenied: true,
    unauthorizedDownloadDenied: true,
    unauthorizedUploadDenied: true,
    unauthorizedDeleteDenied: true,
    assignmentGrantAndRevoke: true,
    authorizedDelete: true,
    syntheticObjectsRemoved: true,
    antivirus: "DEFERRED",
  };
} catch (error) {
  failure = {
    status: "FAIL",
    stage,
    code:
      typeof error === "object" && error && "code" in error
        ? String(error.code)
        : error instanceof Error
          ? error.name
          : "UNKNOWN",
  };
} finally {
  await cleanup();
}

if (failure) {
  console.error(JSON.stringify(failure));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(results));
}
