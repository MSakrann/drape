import { describe, expect, it } from "vitest";
import { catalogObjectPath } from "./storage";

describe("catalogObjectPath", () => {
  it("nests user, job, and file name", () => {
    expect(catalogObjectPath("u1", "job-1", "shop.jpg")).toBe("u1/job-1/shop.jpg");
  });
});
