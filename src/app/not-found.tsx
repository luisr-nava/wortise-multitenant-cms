"use client";

import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#18181b_1px,transparent_1px)] bg-size-[32px_32px] opacity-50"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-zinc-100/50 dark:bg-zinc-900/20 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-2xl w-full text-center relative z-10">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-4xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-4xl shadow-2xl mb-10 animate-bounce">
          404
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6 uppercase">
          Lost in the <br />
          <span className="text-zinc-400 dark:text-zinc-700 font-black">
            Metaverse
          </span>
        </h1>

        <p className="text-lg md:text-2xl text-zinc-500 dark:text-zinc-400 mb-12 font-medium max-w-lg mx-auto leading-relaxed">
          The content you are looking for has been moved, deleted, or never
          existed in this timeline.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto px-10 py-7 rounded-3xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-black text-lg hover:scale-105 transition-all shadow-2xl gap-3">
              <Home size={22} />
              Return Home
            </Button>
          </Link>
          <Link href="/authors" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto px-10 py-7 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-black text-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all gap-3">
              <Search size={22} />
              Browse Authors
            </Button>
          </Link>
        </div>

        <div className="mt-20 pt-10 border-t border-zinc-100 dark:border-zinc-900">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-bold uppercase tracking-widest text-xs transition-colors">
            <ArrowLeft size={14} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

