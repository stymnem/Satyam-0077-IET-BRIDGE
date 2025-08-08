import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Plus, Edit, Trash2, Calendar } from "lucide-react";
import api from "@/api/axios";
import type { Education } from "@/types";

/* =======================================================================
 * Backend DTO (per user description)
 * {
 *   id: number,
 *   degree: string,
 *   branch: string,
 *   institute: string,
 *   graduationYear: number
 * }
 * =====================================================================*/

const schema = z.object({
  institute: z.string().min(1, "Institute is required"),
  degree: z.string().min(1, "Degree is required"),
  branch: z.string().min(1, "Branch is required"),
  graduationYear: z
    .number({ invalid_type_error: "Year must be a number" })
    .int()
    .gte(1900, "Year looks too old")
    .lte(new Date().getFullYear() + 10, "Year looks too far in future"),
});

type FormData = z.infer<typeof schema>;

export default function EducationPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const qc = useQueryClient();

  /* ---------------- fetch list ---------------- */
  const { data: educations = [], isLoading } = useQuery<Education[]>({
    queryKey: ["education"],
    queryFn: async () => {
      const { data } = await api.get<Education[]>("/education");
      return data ?? [];
    },
  });

  /* ---------------- create ---------------- */
  const createMutation = useMutation({
    mutationFn: (d: FormData) => api.post("/education", d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["education"] });
      toast.success("Education added");
      closeDialog();
    },
    onError: () => toast.error("Failed to add education"),
  });

  /* ---------------- update ---------------- */
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      api.put(`/education/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["education"] });
      toast.success("Education updated");
      closeDialog();
    },
    onError: () => toast.error("Failed to update education"),
  });

  /* ---------------- delete ---------------- */
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/education/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["education"] });
      toast.success("Education removed");
    },
    onError: () => toast.error("Failed to delete education"),
  });

  /* ---------------- form ---------------- */
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      institute: "",
      degree: "",
      branch: "",
      graduationYear: new Date().getFullYear(),
    },
  });

  const submit = (d: FormData) => {
    editingId
      ? updateMutation.mutate({ id: editingId, data: d })
      : createMutation.mutate(d);
  };

  const openForEdit = (e: Education) => {
    setEditingId(e.id);
    setValue("institute", e.institute);
    setValue("degree", e.degree);
    setValue("branch", e.branch);
    setValue("graduationYear", e.graduationYear);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    reset();
  };

  /* ---------------- UI ---------------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Education</h1>
          <p className="text-muted-foreground">Manage your academic history</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Education
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Education" : "Add Education"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update your record"
                  : "Add a new educational qualification"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(submit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  id="institute"
                  label="Institute"
                  error={errors.institute?.message}
                  register={register}
                />
                <FormField
                  id="degree"
                  label="Degree"
                  error={errors.degree?.message}
                  register={register}
                />
                <FormField
                  id="branch"
                  label="Branch"
                  error={errors.branch?.message}
                  register={register}
                />
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    type="number"
                    id="graduationYear"
                    {...register("graduationYear", { valueAsNumber: true })}
                  />
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
                  disabled={
                    isSubmitting ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                >
                  {isSubmitting ? "Saving…" : editingId ? "Update" : "Add"}
                </Button>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <section className="grid gap-4">
        {educations.length ? (
          educations.map((e) => (
            <Card key={e.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      {e.degree} – {e.branch}
                    </CardTitle>
                    <CardDescription>{e.institute}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openForEdit(e)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(e.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Graduation Year: {e.graduationYear}
                <Badge variant="secondary" className="ml-auto">
                  {e.degree}
                </Badge>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No education records yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Add your first educational qualification to showcase your
                background.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Education
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

/* ————————————————————————— helpers ——————————————————————— */
function FormField({
  id,
  label,
  register,
  error,
}: {
  id: keyof FormData;
  label: string;
  register: ReturnType<typeof useForm>["register"];
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...register(id)} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
