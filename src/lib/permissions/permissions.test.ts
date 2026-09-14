import { describe, expect, it } from "vitest";

import { hasEveryPermission, hasPermission } from "./permissions";

describe("permission helpers", () => {
  it("grants only explicitly assigned permissions", () => {
    const granted = ["clients.view", "cases.view"];
    expect(hasPermission(granted, "clients.view")).toBe(true);
    expect(hasPermission(granted, "clients.edit")).toBe(false);
  });

  it("supports the administrator wildcard", () => {
    expect(hasPermission(["*"], "roles.manage")).toBe(true);
  });

  it("requires every requested permission", () => {
    expect(
      hasEveryPermission(
        ["documents.view", "cases.view"],
        ["documents.view", "cases.view"],
      ),
    ).toBe(true);
    expect(
      hasEveryPermission(["documents.view"], ["documents.view", "cases.edit"]),
    ).toBe(false);
  });
});
