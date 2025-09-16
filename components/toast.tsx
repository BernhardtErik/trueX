"use client";
import { useEffect, useState } from "react";

type ToastDetail = { type: "success" | "error" | "info"; message: string };

type ToastState = (ToastDetail & { id: number }) | null;

export default function Toast() {
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      if (!detail) return;
      const id = Date.now();
      setToast({ id, ...detail });
      const timeout = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timeout);
    };
    window.addEventListener("toast", handler as EventListener);
    return () => window.removeEventListener("toast", handler as EventListener);
  }, []);

  if (!toast) return null;

  const color = toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-gray-800";

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <div className={`${color} text-white rounded-medium shadow-lg px-4 py-2`}>{toast.message}</div>
    </div>
  );
}
