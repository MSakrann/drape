import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerClientMock, executeGenerateMock, executeChoosePlanMock } =
  vi.hoisted(() => ({
    createServerClientMock: vi.fn(),
    executeGenerateMock: vi.fn(),
    executeChoosePlanMock: vi.fn(),
  }));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: createServerClientMock,
}));

vi.mock("@/lib/generate-service", () => ({
  executeGenerate: executeGenerateMock,
}));

vi.mock("@/lib/choose-plan", () => ({
  executeChoosePlan: executeChoosePlanMock,
}));

import { POST as generate } from "@/app/api/generate/route";
import { GET as generations } from "@/app/api/generations/route";
import { POST as choosePlan } from "@/app/api/billing/choose-plan/route";

function authenticatedClient(extra: object = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-1" } },
      }),
    },
    ...extra,
  };
}

describe("POST /api/generate", () => {
  beforeEach(() => {
    createServerClientMock.mockReset();
    executeGenerateMock.mockReset();
  });

  it("returns 401 when there is no session user", async () => {
    createServerClientMock.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    const response = await generate(
      new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ workflow: "studio" }),
      }),
    );

    expect(response.status).toBe(401);
    expect(executeGenerateMock).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    createServerClientMock.mockResolvedValue(authenticatedClient());

    const response = await generate(
      new Request("http://localhost/api/generate", {
        method: "POST",
        body: "{",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Invalid JSON body." });
  });

  it("returns 400 for an unknown workflow", async () => {
    createServerClientMock.mockResolvedValue(authenticatedClient());

    const response = await generate(
      new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ workflow: "unknown" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Invalid workflow." });
    expect(executeGenerateMock).not.toHaveBeenCalled();
  });
});

describe("GET /api/generations", () => {
  beforeEach(() => {
    createServerClientMock.mockReset();
  });

  it("filters jobs to the current user", async () => {
    const limit = vi.fn().mockResolvedValue({ data: [], error: null });
    const order = vi.fn().mockReturnValue({ limit });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    createServerClientMock.mockResolvedValue(
      authenticatedClient({ from: vi.fn().mockReturnValue({ select }) }),
    );

    const response = await generations();

    expect(response.status).toBe(200);
    expect(eq).toHaveBeenCalledWith("user_id", "user-1");
  });
});

describe("POST /api/billing/choose-plan", () => {
  beforeEach(() => {
    createServerClientMock.mockReset();
    executeChoosePlanMock.mockReset();
  });

  it("returns 400 for malformed JSON", async () => {
    createServerClientMock.mockResolvedValue(authenticatedClient());

    const response = await choosePlan(
      new Request("http://localhost/api/billing/choose-plan", {
        method: "POST",
        body: "{",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Invalid JSON body." });
  });

  it("returns 400 for an unknown plan", async () => {
    createServerClientMock.mockResolvedValue(authenticatedClient());

    const response = await choosePlan(
      new Request("http://localhost/api/billing/choose-plan", {
        method: "POST",
        body: JSON.stringify({ plan: "enterprise" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Invalid plan." });
    expect(executeChoosePlanMock).not.toHaveBeenCalled();
  });

  it("rejects trial because it is not a selectable paid plan", async () => {
    createServerClientMock.mockResolvedValue(authenticatedClient());

    const response = await choosePlan(
      new Request("http://localhost/api/billing/choose-plan", {
        method: "POST",
        body: JSON.stringify({ plan: "trial" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Invalid plan." });
  });
});
