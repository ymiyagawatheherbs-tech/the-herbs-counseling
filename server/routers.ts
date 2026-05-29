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

// ── 共有スキーマ ────────────────────────────────────────────────────────────

const CounselingSessionInput = z.object({
  clientName: z.string().min(1),
  clientKana: z.string().optional(),
  clientDob: z.string().optional(),
  clientJob: z.string().optional(),
  clientAddress: z.string().optional(),
  clientTel: z.string().optional(),
  clientMobile: z.string().optional(),
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
  colorHistory: z.string().optional(),
  hasMedication: z.boolean().optional(),
  medicationDetail: z.string().optional(),
  hasPollen: z.boolean().optional(),
  pollenTypes: z.array(z.string()).optional(),
  lifestyleHabits: z.array(z.string()).optional(),
  foodNotes: z.string().optional(),
  hasIllness: z.boolean().optional(),
  illnessDetail: z.string().optional(),
  visitReason: z.string().optional(),
  request: z.string().optional(),
  accessChannel: z.enum(["store", "sns", "line", "web", "other"]).default("other"),
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
      .mutation(async ({ input }) => {
        const result = await verifyPasscode(input.code);
        if (!result) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "パスコードが正しくありません" });
        }
        return {
          type: result.type,
          partnerSalonId: result.partnerSalonId ?? null,
          salonName: result.salonName ?? null,
          label: result.label ?? null,
        };
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
          hasMedication: input.hasMedication ?? false,
          hasPollen: input.hasPollen ?? false,
          hasIllness: input.hasIllness ?? false,
        });
        return { success: true };
      }),

    // 全セッション一覧（管理者用）
    listAll: publicProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input }) => {
        return await getCounselingSessions({ limit: input.limit, offset: input.offset });
      }),

    // パートナーサロン専用一覧
    listByPartner: publicProcedure
      .input(z.object({ partnerSalonId: z.number().int(), limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input }) => {
        return await getCounselingSessions({
          partnerSalonId: input.partnerSalonId,
          limit: input.limit,
          offset: input.offset,
        });
      }),

    // 個別詳細取得
    getById: publicProcedure
      .input(z.object({ id: z.number().int(), partnerSalonId: z.number().int().optional() }))
      .query(async ({ input }) => {
        const session = await getCounselingSessionById(input.id, input.partnerSalonId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "データが見つかりません" });
        return session;
      }),

    // 体質タイプ別集計
    typeStats: publicProcedure
      .input(z.object({ partnerSalonId: z.number().int().optional() }))
      .query(async ({ input }) => {
        return await getTypeStats(input.partnerSalonId);
      }),

    // アクセス経路別集計
    channelStats: publicProcedure
      .input(z.object({ partnerSalonId: z.number().int().optional() }))
      .query(async ({ input }) => {
        return await getChannelStats(input.partnerSalonId);
      }),
  }),

  // ── パートナーサロン管理（管理者用） ──────────────────────────────────────
  admin: router({
    listSalons: publicProcedure.query(async () => {
      return await getAllPartnerSalons();
    }),

    createSalon: publicProcedure
      .input(z.object({ name: z.string().min(1), passcode: z.string().min(3) }))
      .mutation(async ({ input }) => {
        await createPartnerSalon(input);
        return { success: true };
      }),

    listPasscodes: publicProcedure.query(async () => {
      return await getAllPasscodes();
    }),

    createPasscode: publicProcedure
      .input(z.object({
        code: z.string().min(3),
        type: z.enum(["general", "partner", "admin"]),
        partnerSalonId: z.number().int().optional(),
        label: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createPasscode(input);
        return { success: true };
      }),

    deactivatePasscode: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        await deactivatePasscode(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
