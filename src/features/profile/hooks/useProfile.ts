import { trpc } from "@/lib/trpc-client";
import { toastSuccess, toastError } from "@/lib/toast";

export const useProfile = () => {
  return trpc.profile.getProfile.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

export const useUpdateProfile = () => {
  const utils = trpc.useUtils();

  return trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      toastSuccess("Profile updated successfully");
      utils.profile.getProfile.invalidate();
    },
    onError: (error) => {
      toastError(error.message || "Failed to update profile");
    },
  });
};

