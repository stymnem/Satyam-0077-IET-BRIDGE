import { useState, useMemo, useEffect } from "react";
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
import {
  Search,
  MapPin,
  Calendar,
  Building,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatDateIST } from "../lib/utils";
import api from "../api/axios";

/* ---------- helpers ---------- */
const toArray = (v) => (Array.isArray(v) ? v : v?.items ?? v?.$values ?? []);
const lc = (v) => (typeof v === "string" ? v.toLowerCase() : "");
const safeDateIST = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "-" : formatDateIST(d);
};
const normalizeUrl = (u) => {
  if (!u) return "";
  let v = u.trim();
  if (!/^https?:\/\//i.test(v)) v = "https://" + v;
  return v;
};
const LS_KEY = "jobApplyLinks";

export default function Jobs() {
  const { user } = useAuth();
  const isAdmin = /admin/i.test(user?.role || "");
  const canCreate = isAdmin || /alumni/i.test(user?.role || "");

  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null); // null => create

  // localStorage for apply links (id -> url)
  const [applyLinks, setApplyLinks] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const saveApplyLinks = (next) => {
    setApplyLinks(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {}
  };

  const queryClient = useQueryClient();

  /* ---------- query: list jobs ---------- */
  const {
    data: jobs = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["jobpostings"],
    queryFn: async () => {
      const res = await api.get("/jobpostings");
      return toArray(res.data);
    },
    retry: (count, err) => {
      const s = err?.response?.status;
      if (s === 401 || s === 403) return false;
      return count < 2;
    },
  });

  /* ---------- form ---------- */
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const openCreate = () => {
    setEditingJob(null);
    reset({
      title: "",
      company: "",
      location: "",
      description: "",
      applyUrl: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (job) => {
    setEditingJob(job);
    const id = job?.id ?? job?.Id;
    reset({
      title: job?.title || "",
      company: job?.company || "",
      location: job?.location || "",
      description: job?.description || "",
      applyUrl: applyLinks?.[id] || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingJob(null);
    reset();
  };

  /* ---------- mutations: create / update / delete ---------- */
  const createMutation = useMutation({
    mutationFn: async (data) => {
      // payload for backend (no applyUrl!)
      const payload = {
        title: data.title.trim(),
        company: data.company.trim(),
        location: (data.location || "").trim(),
        description: (data.description || "").trim(),
      };
      const res = await api.post("/jobpostings", payload);
      return res.data; // expect id
    },
    onSuccess: (created, _vars) => {
      // store local apply url if provided
      const newId = created?.id ?? created?.Id;
      const rawUrl = (_vars?.applyUrl || "").trim();
      if (newId && rawUrl) {
        const url = normalizeUrl(rawUrl);
        const next = { ...applyLinks, [newId]: url };
        saveApplyLinks(next);
      }
      toast.success("Job created");
      queryClient.invalidateQueries({ queryKey: ["jobpostings"] });
      closeDialog();
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Failed to create job"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      // backend payload only (no applyUrl)
      const payload = {
        title: data.title.trim(),
        company: data.company.trim(),
        location: (data.location || "").trim(),
        description: (data.description || "").trim(),
      };
      const res = await api.put(`/jobpostings/${id}`, payload);
      return res.data;
    },
    onSuccess: (_updated, vars) => {
      const { id, data } = vars || {};
      const rawUrl = (data?.applyUrl || "").trim();

      const next = { ...applyLinks };
      if (rawUrl) {
        next[id] = normalizeUrl(rawUrl);
      } else {
        // if cleared, remove stored link
        delete next[id];
      }
      saveApplyLinks(next);

      toast.success("Job updated");
      queryClient.invalidateQueries({ queryKey: ["jobpostings"] });
      closeDialog();
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Failed to update job"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/jobpostings/${id}`);
    },
    onSuccess: (_d, id) => {
      // also remove local link
      if (applyLinks[id]) {
        const next = { ...applyLinks };
        delete next[id];
        saveApplyLinks(next);
      }
      toast.success("Job deleted");
      queryClient.invalidateQueries({ queryKey: ["jobpostings"] });
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Failed to delete job"
      );
    },
  });

  const onSubmit = (data) => {
    if (editingJob) {
      const id = editingJob.id ?? editingJob.Id;
      updateMutation.mutate({ id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredJobs = jobs.filter(Boolean).filter((job) => {
    const haystack = [
      job?.title ?? "",
      job?.company ?? "",
      job?.location ?? "",
      job?.description ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(lc(searchTerm));
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Create */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Postings</h1>
          <p className="text-muted-foreground">
            Discover career opportunities from the alumni network
          </p>
        </div>

        {canCreate && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingJob ? "Edit Job" : "Create Job"}
                </DialogTitle>
                <DialogDescription>
                  {editingJob
                    ? "Update the job posting details."
                    : "Fill in details to create a new job posting."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Frontend Engineer"
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Acme Corp"
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Remote / City"
                    {...register("location")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Role summary, responsibilities, etc."
                    {...register("description")}
                  />
                </div>

                {/* NEW: Application Link (client-side only) */}
                <div className="space-y-2">
                  <Label htmlFor="applyUrl">Application Link (optional)</Label>
                  <Input
                    id="applyUrl"
                    placeholder="https://company.jobs/apply/123"
                    {...register("applyUrl", {
                      validate: (val) => {
                        if (!val?.trim()) return true;
                        const v = normalizeUrl(val);
                        try {
                          new URL(v);
                          return true;
                        } catch {
                          return "Enter a valid URL";
                        }
                      },
                    })}
                  />
                  {errors.applyUrl && (
                    <p className="text-sm text-destructive">
                      {errors.applyUrl.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This link is stored only on your device (not sent to the
                    server).
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingJob
                      ? "Update Job"
                      : "Create Job"}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* errors */}
      {isError && (
        <div className="rounded border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <div className="font-medium mb-1">Failed to load jobs.</div>
          <pre className="whitespace-pre-wrap">
            {error?.response?.data?.message ||
              error?.message ||
              "Unknown error"}
          </pre>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job, idx) => {
          const id = job?.id ?? job?.Id ?? idx;
          const posted =
            job?.postedAt ?? job?.PostedAt ?? job?.posted_at ?? null;

          const applyUrl = applyLinks?.[id]; // client-side stored link

          return (
            <Card key={id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-xl">
                      {job?.title || "Untitled role"}
                    </CardTitle>
                    <CardDescription className="text-base">
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="h-4 w-4" />
                        {job?.company || "-"}
                      </div>
                    </CardDescription>
                  </div>

                  {/* Admin-only controls */}
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        title="Edit"
                        onClick={() => openEdit(job)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        title="Delete"
                        onClick={() => {
                          if (confirm("Delete this job posting?")) {
                            deleteMutation.mutate(id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job?.location || "-"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Posted {posted ? safeDateIST(posted) : "-"}
                  </div>
                </div>

                {job?.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {job.description}
                    </p>
                  </div>
                )}

                {/* Apply Now button if a link exists for this job */}
                {applyUrl && (
                  <div className="pt-1">
                    <Button asChild className="w-full sm:w-auto">
                      <a
                        href={applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open application link"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Apply Now
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!filteredJobs.length && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No jobs found</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Try adjusting your search."
                : "Check back later for new roles."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
