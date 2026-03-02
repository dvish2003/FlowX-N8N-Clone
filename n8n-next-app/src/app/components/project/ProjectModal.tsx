"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../stores";
import { BaseModal } from "../general/BaseModal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  closeModal,
  fetchProjects,
  setCurrentProject,
} from "@/stores/ProjectSlice";
import { makeHttpsReq } from "../../helper/makeHttpsReq";
import { showError, toastSuccess } from "@/lib/utils";
import { useEffect } from "react";
import type { Session } from "next-auth";
import { useRouter } from "next/navigation";

type SessionWithId = Session & {
  user?: (Session["user"] & { id?: string | null }) | undefined;
};

const fromSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Project name must be at least 3 characters" })
    .max(50, { message: "Project name must be at most 50 characters" }),
});

type formSchemaType = z.infer<typeof fromSchema>;

interface CreateProjectResponse {
  message: string;
  newProject: {
    _id: string;
    name: string;
    userId: string;
  };
}

export function ProjectModal({ session }: { session: SessionWithId | null }) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { modal, currentProject } = useSelector(
    (state: RootState) => state.project
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<formSchemaType>({
    resolver: zodResolver(fromSchema),
  });

  useEffect(() => {
    if (currentProject?.edit) {
      setValue("name", currentProject?.name || "");
    } else {
      reset({ name: "" });
    }
  }, [setValue, reset, currentProject]);

  const onSubmit = async (data: formSchemaType) => {
    const isEdit = Boolean(currentProject?.edit && currentProject?.id);
    const userId = session?.user?.id;
    
    if (!userId) {
      showError("Please login to save projects");
      return;
    }

    try {
      if (isEdit) {
        await makeHttpsReq("PUT", "projects", {
          id: currentProject!.id!,
          userId,
          name: data?.name,
        });
        toastSuccess("Project updated successfully");
      } else {
        const result = await makeHttpsReq<any>("POST", "projects", {
          userId,
          name: data?.name,
        }) as CreateProjectResponse;
        
        toastSuccess("Project created successfully");
        
        // Immediate redirection to workflow canvas for the new project
        if (result?.newProject?._id) {
           router.push(`/workflows?id=${result.newProject._id}`);
        }
      }

      // Cleanup and refresh
      reset();
      dispatch(closeModal());
      dispatch(fetchProjects({ page: 1, search: "" }));
      
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : currentProject?.edit
          ? "Failed to update project"
          : "Failed to create project";
      showError(errorMessage);
    }
  };

  return (
    <div>
      <BaseModal
        open={modal}
        onOpenChange={() => dispatch(closeModal())}
        title={currentProject?.edit ? "Edit Project" : "Create New Project"}
        description=""
        width={500}
        height={280}
        footer={<></>}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-3 p-3 mb-4">
            <Input
              {...register("name")}
              className="placeholder:text-xs"
              id="name-1"
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => dispatch(closeModal())}
              >
                Cancel
              </Button>
              <Button
                className="cursor-pointer"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {currentProject?.edit
                      ? "Update Project"
                      : "Create Project"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </BaseModal>
    </div>
  );
}
