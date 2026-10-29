"use client";

import { useCallback, useRef, useState } from "react";

export type ApiState<T> = { data: T | null; error: string | null; code: string | null; loading: boolean };

/** Small fetch hook for the AI endpoints: one in-flight request at a time, honest error messages, nothing cached. */
export function useApi<T>(endpoint: string) {
  const [state, setState] = useState<ApiState<T>>({ data: null, error: null, code: null, loading: false });
  const abort = useRef<AbortController | null>(null);

  const run = useCallback(
    async (body: unknown): Promise<T | null> => {
      abort.current?.abort();
      const controller = new AbortController();
      abort.current = controller;
      setState({ data: null, error: null, code: null, loading: true });
      try {
        const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: controller.signal });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.ok) {
          setState({ data: json.data as T, error: null, code: null, loading: false });
          return json.data as T;
        }
        setState({ data: null, error: json.message ?? "Something went wrong. Please try again.", code: json.error ?? "failed", loading: false });
      } catch (e) {
        if ((e as Error).name === "AbortError") return null;
        setState({ data: null, error: "We couldn't reach the server. Check your connection and try again.", code: "network", loading: false });
      }
      return null;
    },
    [endpoint],
  );

  const reset = useCallback(() => {
    abort.current?.abort();
    setState({ data: null, error: null, code: null, loading: false });
  }, []);

  return { ...state, run, reset };
}
