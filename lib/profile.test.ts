import { describe, expect, it } from "vitest";

import { readProfileQuery } from "./profile";

describe("readProfileQuery", () => {
  it("returns the profile when the query succeeds", () => {
    const result = readProfileQuery({
      data: { credits: 20, plan: "trial" },
      error: null,
    });

    expect(result).toEqual({
      ok: true,
      profile: { credits: 20, plan: "trial" },
    });
  });

  it("treats zero rows as a missing profile instead of a crash", () => {
    const result = readProfileQuery({
      data: null,
      error: { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned" },
    });

    expect(result).toEqual({
      ok: false,
      missing: true,
      message: "Profile not found.",
    });
  });

  it("treats a null row with no error as missing", () => {
    const result = readProfileQuery({
      data: null,
      error: null,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.missing).toBe(true);
    }
  });

  it("does not mark a missing table as a missing row", () => {
    const result = readProfileQuery({
      data: null,
      error: { code: "42P01", message: 'relation "public.profiles" does not exist' },
    });

    expect(result).toEqual({
      ok: false,
      missing: false,
      message: 'relation "public.profiles" does not exist',
    });
  });
});
