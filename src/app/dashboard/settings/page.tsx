"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useProfile,
  useUpdateProfile,
} from "@/features/profile/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Calendar } from "lucide-react";
import { useEffect } from "react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

import { FormContainer, FormCard } from "@/components/layout/FormLayout";

export default function SettingsPage() {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile?.name) {
      setValue("name", profile.name);
    }
  }, [profile, setValue]);

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="pb-20">
        <div className="max-w-3xl mx-auto px-6 mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <FormContainer>
          <FormCard>
            <div className="space-y-6">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </FormCard>
        </FormContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 font-bold">
        Error loading profile. Please try again later.
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="max-w-3xl mx-auto px-6 mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Manage your public profile information.
        </p>
      </div>

      <FormContainer>
        <FormCard>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Info Header */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
              <h2 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <User size={18} />
                Personal Information
              </h2>
            </div>

            {/* Profile Image (Read Only / Placeholder for now) */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                {profile?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.image}
                    alt={profile.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-zinc-400" />
                )}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                <p>Profile picture coming soon.</p>
              </div>
            </div>

            <Input
              label="Display Name"
              placeholder="Your name"
              {...register("name")}
              error={errors.name?.message}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-zinc-400" />
                </div>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 cursor-not-allowed text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Member Since
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-zinc-400" />
                </div>
                <div className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm flex items-center font-medium">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString(
                        undefined,
                        { year: "numeric", month: "long", day: "numeric" },
                      )
                    : "-"}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                isLoading={updateProfileMutation.isPending}
                disabled={!profile}
                className="px-8 h-12 rounded-2xl">
                Save Changes
              </Button>
            </div>
          </form>
        </FormCard>
      </FormContainer>
    </div>
  );
}

