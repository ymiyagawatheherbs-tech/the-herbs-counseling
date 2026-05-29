import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { signPasscodeSession, PASSCODE_COOKIE_NAME } from "./passcodeAuth";

// DB モック（実際のDBに接続しない）
vi.mock("./db", () => ({
  verifyPasscode: vi.fn(async (code: string) => {
    if (code === "admin2024") return { type: "admin", partnerSalonId: null, salonName: null, label: "管理者" };
    if (code === "partner001") return { type: "partner", partnerSalonId: 1, salonName: "テストサロン", label: "テストサロン" };
    if (code === "herbs2024") return { type: "general", partnerSalonId: null, salonName: null, label: "一般" };
    return null;
  }),
  createCounselingSession: vi.fn(async () => {}),
  getCounselingSessions: vi.fn(async () => []),
  getCounselingSessionById: vi.fn(async () => null),
  getTypeStats: vi.fn(async () => []),
  getChannelStats: vi.fn(async () => []),
  getAllPartnerSalons: vi.fn(async () => []),
  getAllPasscodes: vi.fn(async () => []),
  createPasscode: vi.fn(async () => {}),
  deactivatePasscode: vi.fn(async () => {}),
  createPartnerSalon: vi.fn(async () => {}),
}));

function makeCtx(cookieStr = ""): TrpcContext {
  return {
    user: null,
    req: { headers: { cookie: cookieStr }, protocol: "https" } as TrpcContext["req"],
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

async function makeAdminCtx() {
  const token = await signPasscodeSession({ type: "admin", partnerSalonId: null, salonName: null, label: "管理者" });
  return makeCtx(`${PASSCODE_COOKIE_NAME}=${token}`);
}

async function makePartnerCtx(partnerSalonId: number) {
  const token = await signPasscodeSession({ type: "partner", partnerSalonId, salonName: "テストサロン", label: "テストサロン" });
  return makeCtx(`${PASSCODE_COOKIE_NAME}=${token}`);
}

describe("passcode.verify", () => {
  it("正しいパスコードで認証成功", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.passcode.verify({ code: "admin2024" });
    expect(result.type).toBe("admin");
  });

  it("誤ったパスコードでUNAUTHORIZEDエラー", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.passcode.verify({ code: "wrong-code-xyz" })).rejects.toThrow("パスコードが正しくありません");
  });
});

describe("counseling.submit（公開API）", () => {
  it("パスコードなしでも診断結果を保存できる", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.counseling.submit({
      clientName: "テスト太郎",
      ectoScore: 5, mesoScore: 3, endoScore: 2,
      primaryType: "ecto",
      accessChannel: "sns",
    });
    expect(result.success).toBe(true);
  });

  it("clientNameが空の場合はバリデーションエラー", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.counseling.submit({
      clientName: "",
      ectoScore: 0, mesoScore: 0, endoScore: 0,
      primaryType: "unknown",
      accessChannel: "web",
    })).rejects.toThrow();
  });
});

describe("counseling.listAll（管理者専用）", () => {
  it("管理者セッションで一覧取得成功", async () => {
    const ctx = await makeAdminCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.counseling.listAll({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("未認証でFORBIDDENエラー", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.counseling.listAll({})).rejects.toThrow("管理者権限が必要です");
  });

  it("パートナーセッションでFORBIDDENエラー", async () => {
    const ctx = await makePartnerCtx(1);
    const caller = appRouter.createCaller(ctx);
    await expect(caller.counseling.listAll({})).rejects.toThrow("管理者権限が必要です");
  });
});

describe("counseling.listByPartner（パートナーサロン専用）", () => {
  it("パートナーセッションで自サロンデータ取得成功", async () => {
    const ctx = await makePartnerCtx(1);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.counseling.listByPartner({ partnerSalonId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("パートナーセッションで他サロンデータ取得はFORBIDDEN", async () => {
    const ctx = await makePartnerCtx(1);
    const caller = appRouter.createCaller(ctx);
    await expect(caller.counseling.listByPartner({ partnerSalonId: 2 })).rejects.toThrow("他のサロンのデータにはアクセスできません");
  });

  it("未認証でFORBIDDENエラー", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.counseling.listByPartner({ partnerSalonId: 1 })).rejects.toThrow("パートナーサロンまたは管理者権限が必要です");
  });
});

describe("admin.listSalons（管理者専用）", () => {
  it("管理者セッションで取得成功", async () => {
    const ctx = await makeAdminCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.listSalons();
    expect(Array.isArray(result)).toBe(true);
  });

  it("未認証でFORBIDDENエラー", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.listSalons()).rejects.toThrow("管理者権限が必要です");
  });
});
