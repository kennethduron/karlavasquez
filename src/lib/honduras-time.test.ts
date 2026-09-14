import { describe, expect, it } from "vitest";

import { formatHondurasTime, HONDURAS_TIME_ZONE } from "./honduras-time";

describe("Honduras time", () => {
  it("always formats in America/Tegucigalpa", () => {
    const instant = new Date("2026-09-14T16:42:00.000Z");

    expect(HONDURAS_TIME_ZONE).toBe("America/Tegucigalpa");
    expect(formatHondurasTime(instant)).toMatch(/^10:42\s*a\.\s*m\.$/i);
  });
});
