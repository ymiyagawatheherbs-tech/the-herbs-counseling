import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("passcode.verify", () => {
  it("should throw UNAUTHORIZED for invalid passcode", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.passcode.verify({ code: "invalid-code-xyz" })
    ).rejects.toThrow();
  });
});

describe("counseling.submit", () => {
  it("should reject submission with empty clientName", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.counseling.submit({
        clientName: "",
        ectoScore: 0,
        mesoScore: 0,
        endoScore: 0,
        primaryType: "unknown",
        accessChannel: "web",
      })
    ).rejects.toThrow();
  });
});

describe("counseling.listAll", () => {
  it("should return an array (possibly empty)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.counseling.listAll({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("counseling.typeStats", () => {
  it("should return stats object with expected keys", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.counseling.typeStats({});
    expect(result).toHaveProperty("ecto");
    expect(result).toHaveProperty("meso");
    expect(result).toHaveProperty("endo");
    expect(result).toHaveProperty("total");
  });
});

describe("admin.listSalons", () => {
  it("should return an array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.listSalons();
    expect(Array.isArray(result)).toBe(true);
  });
});
