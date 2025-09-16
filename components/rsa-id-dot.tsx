"use client";
import React, { useEffect, useState } from "react";
import { DotIndicator, DotStatus } from "./dot-indicator";

// South African ID validation utilities
function isDigits13(val: string): boolean {
  return /^\d{13}$/.test(val);
}

function luhnCheck(id: string): boolean {
  // SA ID uses a Luhn-like checksum
  // Implementation based on standard Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  for (let i = id.length - 1; i >= 0; i--) {
    let digit = parseInt(id.charAt(i), 10);
    if (shouldDouble) {
      digit = digit * 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function isValidSouthAfricanId(id: string): boolean {
  if (!isDigits13(id)) return false;
  return luhnCheck(id);
}

export function RsaIdDot() {
  const [status, setStatus] = useState<DotStatus>("idle");

  useEffect(() => {
    const handler = (e: Event) => {
      const value = (e as CustomEvent<string>).detail ?? "";
      if (!value) {
        setStatus("idle");
        return;
      }
      setStatus(isValidSouthAfricanId(value) ? "valid" : "invalid");
    };
    window.addEventListener("rsa-id-change", handler as EventListener);
    return () => window.removeEventListener("rsa-id-change", handler as EventListener);
  }, []);

  return <DotIndicator status={status} />;
}
