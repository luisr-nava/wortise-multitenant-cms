"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { trpc } from "@/lib/trpc-client";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const createOrgSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
});

type CreateOrgValues = z.infer<typeof createOrgSchema>;

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrganizationModal({
  isOpen,
  onClose,
}: CreateOrganizationModalProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOrgValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: "",
    },
  });

  const switchMutation = trpc.organizations.switchOrganization.useMutation({
    onSuccess: (data) => {
      toast.success(`Organization created and switched to ${data.slug}`);
      onClose();
      reset();
      utils.organizations.listMyOrganizations.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to switch to new organization");
    },
  });

  const createMutation = trpc.organizations.create.useMutation({
    onSuccess: (newOrg) => {
      // Automatically switch to the new organization
      switchMutation.mutate({ slug: newOrg.slug });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create organization");
    },
  });

  const onSubmit = (values: CreateOrgValues) => {
    // Generate slug from name
    const slug = values.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    createMutation.mutate({
      name: values.name,
      slug: slug || `org-${Math.random().toString(36).substring(2, 7)}`,
    });
  };

  const isLoading = createMutation.isPending || switchMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Organization">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Organization Name"
          {...register("name")}
          placeholder="Ex: My Awesome Company"
          error={errors.name?.message}
          disabled={isLoading}
          autoFocus
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} className="min-w-[120px]">
            Create Organization
          </Button>
        </div>
      </form>
    </Modal>
  );
}

