import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  verifyPasscode,
  createCounselingSession,
  getCounselingSessions,
  getCounselingSessionById,
  getTypeStats,
  getChannelStats,
  getAllPartnerSalons,
  getAllPasscodes,
  createPasscode,
  deactivatePasscode,
  createPartnerSalon,
} from "./db";
import {
  PASSCODE_COOKIE_NAME,
  signPasscodeSession,
  getPasscodeSessionFromRequest,
} from "./passcodeAuth";

// ── 共有スキーマ ────────────────────────────────────────────────────────────

// 個人を特定する情報（氏名・生年月日・住所・電話・自由記述・服薬内容）は
// 受け取りません。端末内での表示と印刷にのみ使用されます。
const CounselingSessionInput = z.object({
  managementNo: z.string().max(64).optional(),
  ageGroup: z.string().max(16).optional(),
  ectoScore: z.number().int().min(0),
  mesoScore: z.number().int().min(0),
  endoScore: z.number().int().min(0),
  primaryType: z.enum(["ecto", "meso", "endo", "unknown"]),
  ectoChecked: z.array(z.string()).optional(),
  mesoChecked: z.array(z.string()).optional(),
  endoChecked: z.array(z.string()).optional(),
  symptoms: z.array(z.string()).optional(),
  hairChildType: z.string().optional(),
  hairTroubles: z.array(z.string()).optional(),
  colorHistory: z.string().max(500).optional(),
  hasPollen: z.boolean().optional(),
  pollenTypes: z.array(z.string()).optional(),
  lifestyleHabits: z.array(z.string()).optional(),
  visitReason: z.string().max(100).optional(),
  accessChannel: z.enum(["store", "sns", "line", "web", "public", "other"]).default("other"),
  partnerSalonId: z.number().int().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── パスコード認証 ──────────────────────────────────────────────────────
  passcode: router({
    verify: publicProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const result = await verifyPasscode(input.code);
        if (!result) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "パスコードが正しくありません" });
        }
        // サーバー側でhttpOnly Cookieを発行
        const token = await signPasscodeSession({
          type: result.type,
          partnerSalonId: result.partnerSalonId ?? null,
          salonName: result.salonName ?? null,
          label: result.label ?? null,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(PASSCODE_COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 1000 * 60 * 60 * 24 * 30, // 30日
        });
        return {
          type: result.type,
          partnerSalonId: result.partnerSalonId ?? null,
          salonName: result.salonName ?? null,
          label: result.label ?? null,
        };
      }),

    // パスコードセッションのログアウト
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(PASSCODE_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── カウンセリングセッション ──────────────────────────────────────────────
  counseling: router({
    // 診断結果を保存（パスコード不要 - 誰でも投稿可能）
    submit: publicProcedure
      .input(CounselingSessionInput)
      .mutation(async ({ input }) => {
        await createCounselingSession({
          ...input,
          ectoChecked: input.ectoChecked ?? [],
          mesoChecked: input.mesoChecked ?? [],
          endoChecked: input.endoChecked ?? [],
          symptoms: input.symptoms ?? [],
          hairTroubles: input.hairTroubles ?? [],
          pollenTypes: input.pollenTypes ?? [],
          lifestyleHabits: input.lifestyleHabits ?? [],
          hasPollen: input.hasPollen ?? false,
        });
        return { success: true };
      }),

    // 全セッション一覧（管理者用 - サーバー側認証必須）
    listAll: publicProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        const session = await getPasscodeSessionFromRequest(ctx.req);
        if (!session || session.type !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "管理者権限が必要です" });
        }
        return await getCounselingSessions({ limit: input.limit, offset: input.offset });
      }),

    // パートナーサロン専用一覧（サーバー側認証必須）
    listByPartner: publicProcedure
      .input(z.object({ partnerSalonId: z.number().int(), limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        const session = await getPasscodeSessionFromRequest(ctx.req);
        if (!session || (session.type !== "admin" && session.type !== "partner")) {
          throw new TRPCError({ code: "FORBIDDEN", message: "パートナーサロンまたは管理者権限が必要です" });
        }
        // パートナーサロンは自分のサロンのデータのみ取得可能
        if (session.type === "partner" && session.partnerSalonId !== input.partnerSalonId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "他のサロンのデータにはアクセスできません" });
        }
        return await getCounselingSessions({
          partnerSalonId: input.partnerSalonId,
          limit: input.limit,
          offset: input.offset,
        });
      }),

    // 個別詳細取得（サーバー側認証必須）
    getById: publicProcedure
      .input(z.object({ id: z.number().int(), partnerSalonId: z.number().int().optional() }))
      .query(async ({ input, ctx }) => {
        const session = await getPasscodeSessionFromRequest(ctx.req);
        if (!session || (session.type !== "admin" && session.type !== "partner")) {
          throw new TRPCError({ code: "FORBIDDEN", message: "権限が必要です" });
        }
        // パートナーサロンは自分のサロンのデータのみ
        const partnerSalonId = session.type === "partner" ? session.partnerSalonId ?? undefined : input.partnerSalonId;
        const record = await getCounselingSessionById(input.id, partnerSalonId ?? undefined);
        if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "データが見つかりません" });
        return record;
      }),

    // 体質タイプ別集計（管理者・パートナーサロン用）
    typeStats: publicProcedure
      .input(z.object({ partnerSalonId: z.number().int().optional() }))
      .query(async ({ input, ctx }) => {
        const session = await getPasscodeSessionFromRequest(ctx.req);
        if (!session || (session.type !== "admin" && session.type !== "partner")) {
          throw new TRPCError({ code: "FORBIDDEN", message: "権限が必要です" });
        }
        const partnerSalonId = session.type === "partner" ? session.partnerSalonId ?? undefined : input.partnerSalonId;
        return await getTypeStats(partnerSalonId);
      }),

    // アクセス経路別集計（管理者・パートナーサロン用）
    channelStats: publicProcedure
      .input(z.object({ partnerSalonId: z.number().int().optional() }))
      .query(async ({ input, ctx }) => {
        const session = await getPasscodeSessionFromRequest(ctx.req);
        if (!session || (session.type !== "admin" && session.type !== "partner")) {
          throw new TRPCError({ code: "FORBIDDEN", message: "権限が必要です" });
        }
        const partnerSalonId = session.type === "partner" ? session.partnerSalonId ?? undefined : input.partnerSalonId;
        return await getChannelStats(partnerSalonId);
      }),
  }),

  // ── パートナーサロン管理（管理者用 - サーバー側認証必須） ──────────────────
  admin: router({
    listSalons: publicProcedure.query(async ({ ctx }) => {
      const session = await getPasscodeSessionFromRequest(ctx.req);
      if (!session || session.type !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "管理者権限が必要です" });
      }
      return await getAllPartnerSalons();
    }),

    createSalon: publicProcedure
      .input(z.object({ name: z.string().min(1), passcode: z.string().min(3) }))
      .mutation(async ({ input, ctx }) => {
        const session = await getPasscodeSessionFromRequest(ctx.req);
        if (!session || session.type !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "管理者権限が必要です" });
        }
        await createPartnerSalon(input);
        return { success: true };
      }),

    listPasscodes: publicProcedure.query(async ({ ctx }) => {
      const session = await getPasscodeSessionFromRequest(ctx.req);
      if (!session || session.type !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "管理者権限が必要です" });
      }
      return await getAllPasscodes();
    }),

    createPasscode: publicProcedure
      .input(z.object({
        code: z.string().min(3),
        type: z.enum(["general", "partner", "admin"]),
        partnerSalonId: z.number().int().optional(),
        label: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const session = await getPasscodeSessionFromRequest(ctx.req);
        if (!session || session.type !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "管理者権限が必要です" });
        }
        await createPasscode(input);
        return { success: true };
      }),

    deactivatePasscode: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input, ctx }) => {
        const session = await getPasscodeSessionFromRequest(ctx.req);
        if (!session || session.type !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "管理者権限が必要です" });
        }
        await deactivatePasscode(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
