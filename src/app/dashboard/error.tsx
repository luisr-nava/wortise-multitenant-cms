"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 p-6 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900 m-6">
      <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600 dark:text-red-400">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
        Something went wrong!
      </h2>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
        We encountered an error while loading this page. Please try again later.
      </p>
      <div className="pt-2">
        <Button onClick={reset} variant="secondary">
          Try again
        </Button>
      </div>
    </div>
  );
}

