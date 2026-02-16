"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/schemas/auth";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc-client";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // tRPC Mutations
  const createOrg = trpc.organizations.create.useMutation();
  const switchOrg = trpc.organizations.switchOrganization.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    setIsLoading(true);

    await authClient.signUp.email(
      {
        email: data.email,
        password: data.password,
        name: data.name,
      },
      {
        onSuccess: async () => {
          try {
            // 1. Create Default Organization
            const name = data.name || "My Organization";
            const baseSlug = name
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, "")
              .substring(0, 20);
            // Append random string to ensure uniqueness and valid slug criteria
            const slug = `${baseSlug || "org"}-${Math.random().toString(36).substring(2, 7)}`;

            await createOrg.mutateAsync({
              name: `${name}'s Org`,
              slug: slug,
            });

            // 2. Switch to that Organization (updates session)
            await switchOrg.mutateAsync({ slug });

            toast.success("Account created successfully!");

            // 3. Redirect to Dashboard
            router.push("/dashboard");
            router.refresh(); // Ensure session cookies are re-read
          } catch (error: any) {
            console.error("Onboarding error:", error);
            // Even if org creation fails, the account is created.
            // We should redirect to login or dashboard (where they might see "No Org" state)
            // But for SaaS flow, we prefer they land correctly.
            setServerError(
              error.message ||
                "Account created, but failed to set up workspace. Please log in.",
            );
            setIsLoading(false);
          }
        },
        onError: (ctx) => {
          setServerError(ctx.error.message || "Something went wrong");
          setIsLoading(false);
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-16">
      <div className="w-full max-w-md">
        <div className="w-full space-y-10 bg-white dark:bg-zinc-950 p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-800">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-black dark:bg-white text-white dark:text-black font-black text-3xl shadow-xl mb-4">
              C
            </div>
            <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
              Get Started
            </h2>
            <p className="text-base text-zinc-500 dark:text-zinc-400 font-medium">
              Join our premium community of writers
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-10">
            {serverError && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-sm text-center font-bold animate-in fade-in slide-in-from-top-2">
                {serverError}
              </div>
            )}

            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-2.5 group">
                <label
                  htmlFor="name"
                  className="block text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors ml-1">
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  disabled={isLoading}
                  {...register("name")}
                  className={`w-full px-5 py-4 rounded-2xl border bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 transition-all duration-300 font-medium ${
                    errors.name
                      ? "border-red-300 focus:border-red-500"
                      : "border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-700"
                  }`}
                />

                {errors.name && (
                  <p className="text-xs text-red-500 font-bold pl-2 animate-in slide-in-from-left-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

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
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors ml-1">
                  Security Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
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
                  <span>Onboarding...</span>
                </div>
              ) : (
                "Initialize Workspace"
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              Already a member?{" "}
              <Link
                href="/login"
                className="font-black text-zinc-900 dark:text-white hover:underline decoration-2 underline-offset-4 transition-all">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

