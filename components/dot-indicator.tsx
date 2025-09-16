"use client";
import React from "react";

export type DotStatus = "idle" | "valid" | "invalid";

export function DotIndicator({ status, label }: { status: DotStatus; label?: string }) {
  const color = status === "valid" ? "bg-green-600" : status === "invalid" ? "bg-red-600" : "bg-gray-300";
  const title = label ?? (status === "valid" ? "Valid ID" : status === "invalid" ? "Invalid ID" : "Waiting for input");
  return (
    <span
      aria-label={title}
      title={title}
      className={`inline-block align-middle w-3 h-3 rounded-full ${color} border border-black/10`}
    />
  );
}
