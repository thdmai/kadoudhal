"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthFormState } from "@/lib/auth/schemas";

type ToastTone = "success" | "error";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  push: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_MS = 3500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = ++idRef.current;
      setItems((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), TOAST_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4"
        aria-live="polite"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={`toast-item pointer-events-auto max-w-md rounded-md border px-4 py-3 text-sm shadow-lg ${
              item.tone === "success" ? "toast-success" : "toast-error"
            }`}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast doit être utilisé dans ToastProvider");
  }
  return ctx;
}

/** Affiche un toast quand une action serveur renvoie un message. */
export function useActionToast(state: AuthFormState | null) {
  const { push } = useToast();
  const lastRef = useRef<AuthFormState | null>(null);

  useEffect(() => {
    if (!state?.message || state === lastRef.current) return;
    lastRef.current = state;
    push(state.message, state.ok ? "success" : "error");
  }, [state, push]);
}
