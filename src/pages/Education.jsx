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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { GraduationCap, Plus, Edit, Trash2, Calendar } from "lucide-react";
import api from "../api/axios";

/* helpers */
const toArray = (v) => (Array.isArray(v) ? v : v?.items ?? v?.$values ?? []);
const CURRENT_MAX_YEAR = 2025;
const MIN_YEAR = 1950;

export default function EducationPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  const {
    data: educations = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["education"],
    queryFn: async () => {
      const res = await api.get("/education");
      return toArray(res.data);
    },
    retry: (count, err) => {
      const s = err?.response?.status;
      if (s === 401 || s === 403) return false;
      return count < 2;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    reset();
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        degree: data.degree.trim(),
        branch: data.branch.trim(),
        institute: data.institute.trim(),
        graduationYear: Number(data.graduationYear),
      };
      const res = await api.post("/education", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
      toast.success("Education record created");
      closeDialog();
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Failed to create education record"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const payload = {
        degree: data.degree.trim(),
        branch: data.branch.trim(),
        institute: data.institute.trim(),
        graduationYear: Number(data.graduationYear),
      };
      const res = await api.put(`/education/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
      toast.success("Education record updated");
      closeDialog();
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Failed to update education record"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/education/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
      toast.success("Education record deleted");
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Failed to delete education record"
      );
    },
  });

  const onSubmit = (data) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const startEdit = (ed) => {
    setEditingId(ed.id);
    setValue("institute", ed.institute || "");
    setValue("degree", ed.degree || "");
    setValue("branch", ed.branch || "");
    setValue("graduationYear", ed.graduationYear ?? "");
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Delete this education record?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            Loading education records...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Education</h1>
          <p className="text-muted-foreground">
            Manage your educational background and qualifications
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-sm hover:shadow md:px-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Education" : "Add Education"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update your educational record details"
                  : "Add a new educational qualification to your profile"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="institute">Institute</Label>
                  <Input
                    id="institute"
                    className="focus-visible:ring-2"
                    placeholder="e.g., ABC University"
                    {...register("institute", {
                      required: "Institute is required",
                    })}
                  />
                  {errors.institute && (
                    <p className="text-sm text-destructive">
                      {errors.institute.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    className="focus-visible:ring-2"
                    placeholder="e.g., B.Tech, M.Sc"
                    {...register("degree", { required: "Degree is required" })}
                  />
                  {errors.degree && (
                    <p className="text-sm text-destructive">
                      {errors.degree.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    className="focus-visible:ring-2"
                    placeholder="e.g., Computer Science"
                    {...register("branch", { required: "Branch is required" })}
                  />
                  {errors.branch && (
                    <p className="text-sm text-destructive">
                      {errors.branch.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    inputMode="numeric"
                    min={MIN_YEAR}
                    max={CURRENT_MAX_YEAR}
                    placeholder={`e.g., ${CURRENT_MAX_YEAR}`}
                    {...register("graduationYear", {
                      required: "Graduation year is required",
                      valueAsNumber: true,
                      validate: (v) => {
                        if (!Number.isInteger(v)) return "Enter a valid year";
                        if (v < MIN_YEAR)
                          return `Year cannot be before ${MIN_YEAR}`;
                        if (v > CURRENT_MAX_YEAR)
                          return `Year cannot be after ${CURRENT_MAX_YEAR}`;
                        return true;
                      },
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepted range: {MIN_YEAR}–{CURRENT_MAX_YEAR}
                  </p>
                  {errors.graduationYear && (
                    <p className="text-sm text-destructive">
                      {errors.graduationYear.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="shadow-sm hover:shadow-md"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingId
                    ? "Update Education"
                    : "Add Education"}
                </Button>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* error box */}
      {isError && (
        <div className="rounded border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <div className="font-medium mb-1">Failed to load education.</div>
          <pre className="whitespace-pre-wrap">
            {error?.response?.data?.message ||
              error?.message ||
              "Unknown error"}
          </pre>
        </div>
      )}

      {/* Education Records */}
      <div className="grid gap-4">
        {educations.length ? (
          educations.map((ed) => (
            <Card
              key={ed.id}
              className="hover:shadow-md transition-shadow border-primary/10"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      {ed.degree} {ed.branch ? `in ${ed.branch}` : ""}
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      {ed.institute}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(ed)}
                      className="hover:shadow-sm"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(ed.id)}
                      disabled={deleteMutation.isPending}
                      className="hover:shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Graduation Year: {ed.graduationYear ?? "-"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-primary/10">
            <CardContent className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No education records</h3>
              <p className="text-muted-foreground mb-4">
                Start building your academic profile by adding your education.
              </p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Education Record
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
