import { ClientToasts } from "@repo/ui/components/base/client-toast";
import { cookies } from "next/headers";

export enum ToastType {
  Error = "error",
  Success = "success",
  Info = "info",
  Warning = "warning",
}

export async function toast(message: string, type: ToastType) {
  "use server";
  const cookieStore = await cookies();
  const id = crypto.randomUUID();
  cookieStore.set(`toast-${id}`, JSON.stringify({ message, type }), {
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
    sameSite: "strict",
  });
}

export async function Toaster() {
  const cookieStore = await cookies();
  const toasts = cookieStore
    .getAll()
    .filter((cookie) => cookie.name.startsWith("toast-") && cookie.value)
    .map((cookie) => {
      const cookieValue: { message: string; type: ToastType } = JSON.parse(
        cookie.value
      );
      return {
        id: cookie.name,
        message: cookieValue.message,
        type: cookieValue.type,
        dismiss: async () => {
          "use server";
          const cookieStore = await cookies();
          cookieStore.delete(cookie.name);
        },
      };
    });

  return <ClientToasts toasts={toasts} />;
}
