import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Building,
} from "lucide-react";
import { formatDate } from "../lib/utils";
import api from "../api/axios";

const MAX_START_ISO = "2025-08-15"; // Start must be on/before 15 Aug 2025
const MAX_END_ISO = "2025-08-31"; // End must be on/before 31 Aug 2025

export default function ProfessionalExperiencePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  const queryClient = useQueryClient();

  const { data: experiences, isLoading } = useQuery({
    queryKey: ["professional-experience"],
    queryFn: async () => {
      const response = await api.get("/professional-experience");
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) =>
      (await api.post("/professional-experience", data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional-experience"] });
      toast.success("Experience record created successfully");
      handleCloseDialog();
    },
    onError: () => toast.error("Failed to create experience record"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) =>
      (await api.put(`/professional-experience/${id}`, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional-experience"] });
      toast.success("Experience record updated successfully");
      handleCloseDialog();
    },
    onError: () => toast.error("Failed to update experience record"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/professional-experience/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional-experience"] });
      toast.success("Experience record deleted successfully");
    },
    onError: () => toast.error("Failed to delete experience record"),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const watchIsCurrentJob = watch("isCurrentJob");
  const watchStart = watch("startDate");

  const onSubmit = (data) => {
    const experienceData = {
      company: data.company,
      title: data.title,
      location: data.location || undefined,
      startDate: data.startDate,
      endDate: data.isCurrentJob ? undefined : data.endDate || undefined,
      description: data.description || undefined,
      isCurrentJob: !!data.isCurrentJob,
    };
    if (editingId)
      updateMutation.mutate({ id: editingId, data: experienceData });
    else createMutation.mutate(experienceData);
  };

  const handleEdit = (experience) => {
    setEditingId(experience.id);
    setIsCurrentJob(!!experience.isCurrentJob);
    setValue("company", experience.company);
    setValue("title", experience.title || "");
    setValue("location", experience.location || "");
    setValue("startDate", (experience.startDate || "").split("T")[0]);
    setValue(
      "endDate",
      experience.endDate ? experience.endDate.split("T")[0] : ""
    );
    setValue("description", experience.description || "");
    setValue("isCurrentJob", !!experience.isCurrentJob);
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this experience record?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setIsCurrentJob(false);
    reset();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            Loading professional experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Professional Experience
          </h1>
          <p className="text-muted-foreground">
            Manage your career history and work experience
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-sm hover:shadow">
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader className="pb-2">
              <DialogTitle>
                {editingId ? "Edit Experience" : "Add Experience"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update your professional experience details."
                  : "Add a new position to your career history."}
              </DialogDescription>
            </DialogHeader>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Company name"
                    {...register("company", {
                      required: "Company is required",
                    })}
                  />
                  {errors.company && (
                    <p className="text-sm text-destructive">
                      {errors.company.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Developer"
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    {...register("location")}
                  />
                </div>

                {/* START DATE with validation */}
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    max={MAX_START_ISO}
                    {...register("startDate", {
                      required: "Start date is required",
                      validate: (value) => {
                        if (!value) return "Start date is required";
                        // must be on or before 15 Aug 2025
                        const selected = new Date(value);
                        const maxAllowed = new Date(
                          `${MAX_START_ISO}T23:59:59`
                        );
                        return (
                          selected <= maxAllowed ||
                          "Start date must be on or before 15 Aug 2025"
                        );
                      },
                    })}
                  />
                  {!errors.startDate && (
                    <p className="text-xs text-muted-foreground">
                      Must be on or before <b>15 Aug 2025</b>.
                    </p>
                  )}
                  {errors.startDate && (
                    <p className="text-sm text-destructive">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-md border p-3">
                <input
                  type="checkbox"
                  id="isCurrentJob"
                  className="rounded"
                  {...register("isCurrentJob")}
                  onChange={(e) => {
                    setIsCurrentJob(e.target.checked);
                    setValue("isCurrentJob", e.target.checked);
                  }}
                />
                <Label htmlFor="isCurrentJob" className="cursor-pointer">
                  I currently work here
                </Label>
              </div>

              {/* END DATE with validation */}
              {!watchIsCurrentJob && (
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    max={MAX_END_ISO}
                    {...register("endDate", {
                      validate: (value) => {
                        if (!value) return true; // optional when not current
                        const end = new Date(value);
                        const maxEnd = new Date(`${MAX_END_ISO}T23:59:59`);
                        if (end > maxEnd)
                          return "End date cannot be after Aug 2025";
                        if (watchStart) {
                          const start = new Date(watchStart);
                          if (end < start)
                            return "End date cannot be before start date";
                        }
                        return true;
                      },
                    })}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-destructive">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe your role and achievements..."
                  {...register("description")}
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Focus on impact—metrics, scope, ownership.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="min-w-[96px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="min-w-[140px]"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingId
                    ? "Update Experience"
                    : "Add Experience"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Experience list */}
      <div className="grid gap-4">
        {experiences && experiences.length > 0 ? (
          experiences
            .slice()
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
            .map((experience) => (
              <Card
                key={experience.id}
                className="hover:shadow-md transition-shadow border-l-4 border-l-primary/60"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <span className="font-semibold">
                          {experience.title || "—"}
                        </span>
                        {experience.isCurrentJob && (
                          <Badge className="ml-1" variant="default">
                            Current
                          </Badge>
                        )}
                      </CardTitle>

                      <CardDescription className="mt-1 text-base flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {experience.company}
                        </span>
                        {experience.location && (
                          <>
                            <span className="opacity-40">•</span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {experience.location}
                            </span>
                          </>
                        )}
                      </CardDescription>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(experience)}
                        className="hover:shadow-sm"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(experience.id)}
                        disabled={deleteMutation.isPending}
                        className="hover:shadow-sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(experience.startDate)} —{" "}
                      {experience.isCurrentJob
                        ? "Present"
                        : experience.endDate
                        ? formatDate(experience.endDate)
                        : "Present"}
                    </div>
                  </div>

                  {experience.description && (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {experience.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
        ) : (
          <Card className="border-dashed">
            <CardContent className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No professional experience
              </h3>
              <p className="text-muted-foreground mb-4">
                Start building your professional profile by adding your work
                experience.
              </p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Work Experience
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
