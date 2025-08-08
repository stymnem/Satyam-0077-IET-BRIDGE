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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar, MapPin, Search, CheckCircle, Plus } from "lucide-react";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import type { Rsvp } from "@/types";

/* API event type for this page */
type ApiEvent = {
  id: number;
  title: string;
  description: string;
  eventDate: string; // ISO
  location: string;
};

/* ───────── helpers */
const fmt = (v?: string | number | Date) => {
  const d = new Date(v ?? "");
  return isNaN(d.getTime())
    ? "TBA"
    : d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(2),
  eventDate: z.string().min(1, "Date & time required"), // we'll convert to ISO
});

/* ───────── component */
export default function Events() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  /* events */
  const { data: events = [], isLoading } = useQuery<ApiEvent[]>({
    queryKey: ["events"],
    queryFn: async () => {
      const { data } = await api.get<ApiEvent[]>("/events");
      return data ?? [];
    },
  });

  /* RSVPs (alumni only) */
  const { data: myRsvps = [] } = useQuery<Rsvp[]>({
    queryKey: ["my-rsvps"],
    queryFn: async () => {
      const { data } = await api.get<Rsvp[]>("/rsvps/mine");
      return data ?? [];
    },
    enabled: !isAdmin,
  });

  /* RSVP mutation */
  const rsvp = useMutation({
    mutationFn: (id: number) => api.post("/rsvps", { eventId: id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-rsvps"] });
      toast.success("RSVP confirmed!");
    },
    onError: () => toast.error("Failed to RSVP"),
  });

  /* post-event mutation */
  const postEvent = useMutation({
    mutationFn: (d: z.infer<typeof schema>) =>
      api.post("/events", {
        // only send fields your API accepts
        title: d.title,
        description: d.description,
        location: d.location,
        eventDate: new Date(d.eventDate).toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created");
      setOpen(false);
    },
    onError: () => toast.error("Failed to create event"),
  });

  /* form */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  /* utilities */
  const isRsvped = (id: number) => myRsvps.some((r) => r.eventId === id);

  const filtered = events.filter((e) => {
    const t = search.toLowerCase();
    return (
      e.title.toLowerCase().includes(t) ||
      e.description.toLowerCase().includes(t) ||
      e.location.toLowerCase().includes(t)
    );
  });

  /* loading */
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* header + admin button */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Discover and join upcoming alumni events
          </p>
        </div>

        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post Event
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>New Event</DialogTitle>
                <DialogDescription>
                  Provide details then publish.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleSubmit((d) => postEvent.mutate(d))}
                className="space-y-4"
              >
                <Field
                  id="title"
                  label="Title"
                  register={register}
                  error={errors.title?.message}
                />
                <Field
                  id="location"
                  label="Location"
                  register={register}
                  error={errors.location?.message}
                />
                <Field
                  id="eventDate"
                  type="datetime-local"
                  label="When"
                  register={register}
                  error={errors.eventDate?.message}
                />
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea rows={3} {...register("description")} />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || postEvent.isPending}
                  >
                    {postEvent.isPending ? "Posting…" : "Publish"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset();
                      setOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </header>

      {/* search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ev) => {
          const upcoming = new Date(ev.eventDate).getTime() > Date.now();
          const past = new Date(ev.eventDate).getTime() < Date.now() - 1000; // tiny buffer
          const rsvped = isAdmin ? false : isRsvped(ev.id);

          return (
            <Card key={ev.id} className={past ? "opacity-75" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{ev.title}</CardTitle>
                  {past ? (
                    <Badge variant="secondary">Past</Badge>
                  ) : upcoming ? (
                    <Badge>Upcoming</Badge>
                  ) : (
                    <Badge variant="destructive">Now</Badge>
                  )}
                </div>
                <CardDescription>{ev.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {fmt(ev.eventDate)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {ev.location}
                  </div>
                </div>

                {!isAdmin && !past && (
                  <div className="pt-2">
                    {rsvped ? (
                      <Button disabled className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        RSVP Confirmed
                      </Button>
                    ) : (
                      <Button
                        onClick={() => rsvp.mutate(ev.id)}
                        disabled={rsvp.isPending}
                        className="w-full"
                      >
                        {rsvp.isPending ? "Processing…" : "RSVP"}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* empty */}
      {!filtered.length && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No events found</h3>
            <p className="text-muted-foreground">
              {search ? "Try another search." : "Check back later."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ───────── tiny field helper */
function Field({
  id,
  label,
  register,
  error,
  type = "text",
}: {
  id: string;
  label: string;
  register: ReturnType<typeof useForm>["register"];
  error?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} {...register(id)} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
