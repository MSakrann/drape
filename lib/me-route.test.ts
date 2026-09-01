import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerClientMock } = vi.hoisted(() => ({
  createServerClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: createServerClientMock,
}));

import { GET } from "@/app/api/me/route";

describe("GET /api/me", () => {
  beforeEach(() => {
    createServerClientMock.mockReset();
  });

  it("returns 401 when there is no session user", async () => {
    createServerClientMock.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("returns credits, plan, and email for the session user", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { credits: 18, plan: "trial" },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    createServerClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "owner@example.com" } },
        }),
      },
      from: vi.fn().mockReturnValue({ select }),
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      credits: 18,
      plan: "trial",
      email: "owner@example.com",
    });
  });
});
