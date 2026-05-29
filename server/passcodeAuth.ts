/**
 * パスコード認証セッション管理
 * パスコード認証後にhttpOnly Cookieを発行し、
 * 管理者・パートナーサロン用APIでサーバー側検証を行う
 */
import { SignJWT, jwtVerify } from "jose";
import type { Request } from "express";
import { ENV } from "./_core/env";
import { parse as parseCookieHeader } from "cookie";

export const PASSCODE_COOKIE_NAME = "herbs_passcode_session";
const ONE_DAY_MS = 1000 * 60 * 60 * 24;

export type PasscodeSessionPayload = {
  type: "general" | "partner" | "admin";
  partnerSalonId: number | null;
  salonName: string | null;
  label: string | null;
};

function getSecret() {
  const secret = ENV.cookieSecret || "herbs-fallback-secret-key-2024";
  return new TextEncoder().encode(secret);
}

export async function signPasscodeSession(payload: PasscodeSessionPayload): Promise<string> {
  const expiresInMs = ONE_DAY_MS * 30; // 30日間有効
  const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1000);
  return new SignJWT({
    type: payload.type,
    partnerSalonId: payload.partnerSalonId,
    salonName: payload.salonName,
    label: payload.label,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(getSecret());
}

export async function verifyPasscodeSession(
  cookieValue: string | undefined | null
): Promise<PasscodeSessionPayload | null> {
  if (!cookieValue) return null;
  try {
    const { payload } = await jwtVerify(cookieValue, getSecret(), {
      algorithms: ["HS256"],
    });
    const { type, partnerSalonId, salonName, label } = payload as Record<string, unknown>;
    if (type !== "general" && type !== "partner" && type !== "admin") return null;
    return {
      type: type as PasscodeSessionPayload["type"],
      partnerSalonId: typeof partnerSalonId === "number" ? partnerSalonId : null,
      salonName: typeof salonName === "string" ? salonName : null,
      label: typeof label === "string" ? label : null,
    };
  } catch {
    return null;
  }
}

export function getPasscodeSessionFromRequest(req: Request): Promise<PasscodeSessionPayload | null> {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  return verifyPasscodeSession(cookies[PASSCODE_COOKIE_NAME]);
}
