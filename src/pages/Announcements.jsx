import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/axios";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Megaphone,
  Plus,
  RotateCw,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react";

/* ---------- helpers ---------- */
const toArray = (v) => (Array.isArray(v) ? v : v?.items ?? v?.$values ?? []);
const fmtIST = (d) => {
  const x = new Date(d);
  return Number.isNaN(x.getTime())
    ? "-"
    : x.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
};

const TITLE_MAX = 120;
const MSG_MAX = 2000;

export default function Announcements() {
  const { user } = useAuth();
  const role = (user?.role || "").toLowerCase();
  const isAdmin = role === "admin";
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null => create

  /* ---------- query: list ---------- */
  const {
    data: list = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const res = await api.get("/announcements");
      return toArray(res.data)
        .map((a) => ({
          id: a.id ?? a.Id,
          title: a.title ?? a.Title,
          message: a.message ?? a.Message,
          createdAt: a.createdAt ?? a.CreatedAt,
          createdBy: a.createdBy ?? a.CreatedBy,
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: (count, err) => {
      const s = err?.response?.status;
      if (s === 401 || s === 403) return false;
      return count < 2;
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((a) =>
      [a.title ?? "", a.message ?? ""].join(" ").toLowerCase().includes(q)
    );
  }, [list, search]);

  /* ---------- dialog form ---------- */
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { title: "", message: "" },
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    reset({ title: "", message: "" });
  };

  const openCreate = () => {
    setEditing(null);
    reset({ title: "", message: "" });
    setDialogOpen(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setDialogOpen(true);
    setValue("title", a.title || "");
    setValue("message", a.message || "");
  };

  /* ---------- mutations ---------- */
  const createMutation = useMutation({
    mutationFn: async (payload) =>
      (await api.post("/announcements", payload)).data,
    onSuccess: () => {
      toast.success("Announcement posted");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      closeDialog();
    },
    onError: (err) =>
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Failed to post announcement"
      ),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) =>
      (await api.put(`/announcements/${id}`, payload)).data,
    onSuccess: () => {
      toast.success("Announcement updated");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      closeDialog();
    },
    onError: (err) =>
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Failed to update announcement"
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/announcements/${id}`),
    onSuccess: () => {
      toast.success("Announcement deleted");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (err) =>
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Failed to delete announcement"
      ),
  });

  const onSubmit = (data) => {
    const payload = {
      title: data.title.trim(),
      message: data.message.trim(),
    };

    if (!payload.title || !payload.message) {
      toast.error("Title and message are required.");
      return;
    }
    if (payload.title.length > TITLE_MAX || payload.message.length > MSG_MAX) {
      toast.error("Content too long. Please shorten and try again.");
      return;
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + actions */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Latest updates for the alumni community
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["announcements"] })
            }
            title="Refresh"
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          {isAdmin && (
            <Dialog
              open={dialogOpen}
              onOpenChange={(o) => (o ? setDialogOpen(true) : closeDialog())}
            >
              <DialogTrigger asChild>
                <Button className="shadow-sm" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Announcement
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-lg">
                <DialogHeader className="pb-2">
                  <DialogTitle>
                    {editing ? "Edit Announcement" : "Publish Announcement"}
                  </DialogTitle>
                  <DialogDescription>
                    {editing
                      ? "Update the title or message and save."
                      : "Share news, deadlines, or important updates."}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Alumni Meet 2025 – Registrations Open"
                      maxLength={TITLE_MAX}
                      {...register("title", { required: "Title is required" })}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      placeholder="Write the details..."
                      maxLength={MSG_MAX}
                      {...register("message", {
                        required: "Message is required",
                      })}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeDialog}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        createMutation.isPending ||
                        updateMutation.isPending
                      }
                    >
                      {editing
                        ? updateMutation.isPending
                          ? "Saving..."
                          : "Save Changes"
                        : createMutation.isPending
                        ? "Publishing..."
                        : "Publish"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search announcements…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <SkeletonList />
      ) : isError ? (
        <ErrorBox title="Failed to load announcements" error={error} />
      ) : filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <Card key={a.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Megaphone className="h-5 w-5 text-primary" />
                      {a.title}
                    </CardTitle>
                    <CardDescription>
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {fmtIST(a.createdAt)}
                      </span>
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Admin #{a.createdBy}</Badge>

                    {isAdmin && (
                      <>
                        <Button
                          size="icon"
                          variant="outline"
                          title="Edit"
                          onClick={() => openEdit(a)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          title="Delete"
                          onClick={() => {
                            if (confirm("Delete this announcement?")) {
                              deleteMutation.mutate(a.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-6">
                  {a.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No announcements yet</h3>
            <p className="text-muted-foreground">
              {isAdmin
                ? "Publish one using the New Announcement button."
                : "Check back soon."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ---------- Small UI helpers ---------- */
function SkeletonList() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-md border p-4 animate-pulse">
          <div className="h-4 w-2/3 bg-muted rounded mb-3" />
          <div className="h-3 w-1/3 bg-muted rounded mb-6" />
          <div className="h-3 w-full bg-muted rounded mb-2" />
          <div className="h-3 w-5/6 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

function ErrorBox({ title, error }) {
  return (
    <div className="rounded border border-destructive/40 bg-destructive/5 p-3">
      <div className="font-medium mb-1">{title}</div>
      <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
        {error?.response?.data?.message || error?.message || "Unknown error"}
      </pre>
    </div>
  );
}
