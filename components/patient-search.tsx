"use client";
import React from "react";
import { Input } from "@heroui/input";
import { Card } from "@heroui/react";
import { Spinner } from "@heroui/spinner";
import { searchPatients, type Patient } from "../services/patients";

interface Props {
  onSelect: (patient: Patient) => void | Promise<void>;
}

export default function PatientSearch({ onSelect }: Props) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const controllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    setOpen(true);

    // simple debounce
    const t = setTimeout(async () => {
      try {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        const data = await searchPatients(q);
        setResults(data);
      } catch (e) {
        // ignore for now
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative w-full max-w-sm">
      <Input
        aria-label="Search patients"
        placeholder="Search patient by name or surname..."
        value={query}
        onValueChange={setQuery}
        variant="bordered"
        size="sm"
      />
      {open && (
        <Card className="absolute z-50 mt-1 w-full p-2">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-sm text-foreground-500 py-2 px-2">No patients found.</div>
          ) : (
            <ul className="max-h-64 overflow-auto divide-y divide-default-200">
              {results.map((p) => (
                <li key={String(p.id)}>
                  <button
                    type="button"
                    className="w-full text-left py-2 px-2 hover:bg-default-100 rounded-small"
                    onClick={async () => {
                      await onSelect(p);
                      setQuery(`${p.firstName ?? ""} ${p.lastName ?? ""}`.trim());
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{[p.firstName, p.lastName].filter(Boolean).join(" ") || `#${p.id}`}</span>
                      {p.email && <span className="text-xs text-foreground-500">{p.email}</span>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
