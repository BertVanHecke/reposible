import { getLocale } from "next-intl/server";
import { messageMap } from "./constants";
import { NextRequest } from "next/server";
import { toast, ToastType } from "@/components/toaster";

export function getEnvVar(varValue: string | undefined, varName: string): string {
  if (varValue === undefined) throw new ReferenceError(`Reference to undefined env var: ${varName}`);
  return varValue;
}

export type ErrorReason = "invalid_token" | "expired_token" | "expected_error";

export async function buildErrorUrl(reason: ErrorReason, request: NextRequest) {
    const locale = await getLocale();
    await toast(messageMap[reason], ToastType.Error);
    return new URL(
        `/${locale}/error?reason=${encodeURIComponent(reason)}`,
        request.nextUrl.origin
    );
}