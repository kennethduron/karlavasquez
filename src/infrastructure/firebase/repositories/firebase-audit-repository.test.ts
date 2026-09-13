import { describe, expect, it } from "vitest";

import { sanitizeAuditMetadata } from "@/infrastructure/firebase/repositories/firebase-audit-repository";

describe("sanitizeAuditMetadata", () => {
  it("removes sensitive and malformed fields and bounds strings", () => {
    expect(
      sanitizeAuditMetadata({
        roleKey: "lawyer",
        password: "never-log-this",
        documentContent: "confidential",
        "invalid-key": "ignored",
        reasonCode: "x".repeat(250),
      }),
    ).toEqual({ roleKey: "lawyer", reasonCode: "x".repeat(200) });
  });
});
