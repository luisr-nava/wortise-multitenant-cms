"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setIsLoading(true);

    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          const from = searchParams.get("from");
          router.push(from || "/dashboard");
          router.refresh();
        },
        onError: (ctx) => {
          setServerError(ctx.error.message || "Invalid email or password");
          setIsLoading(false);
        },
      },
    );
  };

  return (
    <div className="w-full max-w-md space-y-10 bg-white dark:bg-zinc-950 p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-800">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-black dark:bg-white text-white dark:text-black font-black text-3xl shadow-xl mb-4">
          C
        </div>
        <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
          Welcome back
        </h2>
        <p className="text-base text-zinc-500 dark:text-zinc-400 font-medium">
          Sign in to your dashboard to continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-10">
        {serverError && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-sm text-center font-bold animate-in fade-in slide-in-from-top-2">
            {serverError}
          </div>
        )}

        <div className="space-y-6">
          {/* Email */}
          <div className="space-y-2.5 group">
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors ml-1">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isLoading}
              {...register("email")}
              className={`w-full px-5 py-4 rounded-2xl border bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 transition-all duration-300 font-medium ${
                errors.email
                  ? "border-red-300 focus:border-red-500"
                  : "border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-700"
              }`}
            />

            {errors.email && (
              <p className="text-xs text-red-500 font-bold pl-2 animate-in slide-in-from-left-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2.5 group">
            <div className="flex items-center justify-between px-1">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors">
                Secret Password
              </label>
            </div>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isLoading}
              {...register("password")}
              className={`w-full px-5 py-4 rounded-2xl border bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 transition-all duration-300 font-medium ${
                errors.password
                  ? "border-red-300 focus:border-red-500"
                  : "border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-700"
              }`}
            />

            {errors.password && (
              <p className="text-xs text-red-500 font-bold pl-2 animate-in slide-in-from-left-1">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-4 px-6 rounded-2xl text-base font-black text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:opacity-90 active:scale-95 transition-all duration-200 shadow-xl shadow-zinc-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-3 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : (
            "Authenticate Now"
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-zinc-900 dark:text-white hover:underline decoration-2 underline-offset-2 transition-all">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-16">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

