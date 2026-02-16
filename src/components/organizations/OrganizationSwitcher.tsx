"use client";

import { trpc } from "@/lib/trpc-client";
import type { AppRouter } from "@/server/routers/_app";
import { type inferRouterOutputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { ChevronsUpDown, Check, Plus, Building2, Loader2 } from "lucide-react";

type Organization =
  RouterOutputs["organizations"]["listMyOrganizations"][number];

export function OrganizationSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch Session (Client-side source of truth for activeOrgId)
  const { data: session } = authClient.useSession();
  const activeOrgId = session?.session?.activeOrganizationId;

  // Fetch User's Organizations
  const {
    data: organizations,
    isLoading,
    refetch,
  } = trpc.organizations.listMyOrganizations.useQuery(undefined, {
    enabled: !!session,
  });

  // Switch Organization Mutation
  const switchOrgMutation = trpc.organizations.switchOrganization.useMutation({
    onSuccess: async (data) => {
      toast.success(`Switched to ${data.slug}`);
      setIsOpen(false);
      // Force refresh to update server components / context
      router.refresh();
      // Invalidate queries to ensure fresh data
      await refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to switch organization");
    },
  });

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitch = (slug: string) => {
    if (switchOrgMutation.isPending) return;
    switchOrgMutation.mutate({ slug });
  };

  if (!session) return null;

  // Find active organization object for display
  const activeOrg = organizations?.find(
    (org) => org._id && org._id.toString() === activeOrgId,
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors w-[200px] justify-between">
        <div className="flex items-center gap-2 truncate">
          <div className="w-5 h-5 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shrink-0">
            {isLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Building2 size={12} />
            )}
          </div>
          <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">
            {isLoading
              ? "Loading..."
              : activeOrg
                ? activeOrg.name
                : "Select Organization"}
          </span>
        </div>
        <ChevronsUpDown size={14} className="text-zinc-500 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[220px] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-[200px] overflow-y-auto">
            <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase">
              My Organizations
            </div>
            {organizations?.map((org) => (
              <button
                key={org._id?.toString()}
                onClick={() => handleSwitch(org.slug)}
                disabled={switchOrgMutation.isPending}
                className="w-full text-left flex items-center justify-between px-2 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`truncate ${org._id && org._id.toString() === activeOrgId ? "font-medium text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-400"}`}>
                    {org.name}
                  </span>
                </div>
                {org._id && org._id.toString() === activeOrgId && (
                  <Check
                    size={14}
                    className="text-zinc-900 dark:text-white shrink-0"
                  />
                )}
              </button>
            ))}
            {organizations?.length === 0 && (
              <div className="px-2 py-2 text-sm text-zinc-500 text-center">
                No organizations found.
              </div>
            )}
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-900 mt-1 pt-1">
            <div className="group relative">
              <div
                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-60 transition-opacity"
                aria-disabled="true">
                <Plus size={14} />
                <span className="font-medium whitespace-nowrap">
                  Create Org (Coming Soon)
                </span>
              </div>

              {/* Tooltip */}
              <div className="invisible group-hover:visible absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] rounded-md shadow-xl z-50 font-bold leading-tight animate-in fade-in slide-in-from-left-1 duration-200">
                Organization self-service will be available in a future release.
                {/* Arrow */}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-zinc-900 dark:border-r-zinc-100" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

