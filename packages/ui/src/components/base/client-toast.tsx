"use client";

import { startTransition, useEffect, useOptimistic, useState } from "react";
import { toast as sonnerToast } from "sonner";
import { Toaster as SonnerToaster } from "@repo/ui/components/base/sonner";

type Toast = {
  id: string;
  message: string;
  type: "error" | "success" | "info" | "warning";
  dismiss: () => Promise<void>;
};

export function ClientToasts({ toasts }: { toasts: Toast[] }) {
  const [optimisticToasts, remove] = useOptimistic(toasts, (current, id) =>
    current.filter((toast) => toast.id !== id)
  );

  const localToasts = optimisticToasts.map((toast) => ({
    ...toast,
    dismiss: async () => {
      remove(toast.id);
      await toast.dismiss();
    },
  }));

  const [sentToSonner, setSentToSonner] = useState<string[]>([]);

  useEffect(() => {
    localToasts
      .filter((toast) => !sentToSonner.includes(toast.id))
      .forEach((toast) => {
        setSentToSonner((prev) => [...prev, toast.id]);
        sonnerToast[toast.type](toast.message, {
          id: toast.id,
          onDismiss: () => startTransition(toast.dismiss),
          onAutoClose: () => startTransition(toast.dismiss),
        });
      });
  }, [localToasts, sentToSonner]);

  return <SonnerToaster position="bottom-right" />;
}
