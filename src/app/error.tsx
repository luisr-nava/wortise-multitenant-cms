"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[Global Error Boundary]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white dark:bg-zinc-950 p-10 md:p-14 rounded-5xl border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-none text-center relative overflow-hidden">
        {/* Error Decor */}
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>

        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 mb-10 shadow-inner border border-red-100 dark:border-red-500/20">
          <AlertTriangle size={40} strokeWidth={2.5} />
        </div>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white mb-4">
          Runtime Exception
        </h1>

        <p className="text-base text-zinc-500 dark:text-zinc-400 mb-12 font-medium leading-relaxed">
          An unexpected error occurred in the application engine. Our engineers
          have been notified.
          {error.digest && (
            <span className="block mt-4 text-[10px] font-mono text-zinc-300 dark:text-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 py-1 rounded">
              ID: {error.digest}
            </span>
          )}
        </p>

        <div className="space-y-4">
          <Button
            onClick={() => reset()}
            size="lg"
            className="w-full py-7 rounded-3xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-black text-lg hover:scale-[1.02] transition-all shadow-xl gap-3">
            <RefreshCw size={20} />
            Initialize Recovery
          </Button>

          <Link href="/" className="block">
            <Button
              variant="ghost"
              size="lg"
              className="w-full py-7 rounded-3xl text-zinc-500 dark:text-zinc-400 font-bold text-lg hover:text-zinc-900 dark:hover:text-white transition-all gap-3">
              <Home size={20} />
              Emergency Exit
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

