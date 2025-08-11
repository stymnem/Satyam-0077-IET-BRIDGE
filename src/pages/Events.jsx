import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Calendar,
  MapPin,
  Search,
  Pencil,
  Trash2,
  Plus,
  CheckCircle,
} from "lucide-react";
import api from "../api/axios";

/* -------- IST helpers -------- */
const IST_TZ = "Asia/Kolkata";
const toArray = (v) => (Array.isArray(v) ? v : v?.items ?? []);

// Format any date/time in **Indian time**
const formatIST = (v) => {
  const d = new Date(v);
  return isNaN(d.getTime())
    ? "TBA"
    : new Intl.DateTimeFormat("en-IN", {
        timeZone: IST_TZ,
        dateStyle: "medium",
        timeStyle: "short",
      }).format(d);
};

// Return **now** as a Date aligned to IST clock time
const nowInIST = () => {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  // IST is UTC+5:30 => 330 minutes
  return new Date(utcMs + 330 * 60000);
};

// Convert a Date to input[type=datetime-local] value ("YYYY-MM-DDTHH:mm")
// NOTE: The browser interprets datetime-local in the user's local tz.
// Since your app is used in India, this will be IST on user machines.
const toLocalInput = (dt) => {
  if (!dt) return "";
  const d = new Date(dt);
  if (isNaN(d.getTime())) return "";
  const tzAdjusted = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tzAdjusted.toISOString().slice(0, 16);
};

// Parse from the input back to a Date (in user's local tz)
const parseLocalInput = (s) => {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

const getRoleFromToken = () => {
  try {
    const raw = localStorage.getItem("token");
    if (!raw) return null;
    const decoded = jwtDecode(raw);
    return (
      decoded?.role ||
      decoded?.[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ] ||
      null
    );
  } catch {
    return null;
  }
};

export default function Events() {
  /* ---- IST "today" anchor ---- */
  const istNow = nowInIST();
  const minAttr = toLocalInput(istNow); // block past times in input
  const minLabel = formatIST(istNow); // human-readable

  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
  });

  /* ---- roles ---- */
  const role = getRoleFromToken();
  const isAdmin = role === "Admin";
  const isAlumni = role === "Alumni";

  /* ---- keeps which events user RSVPed ---- */
  const [rsvpedIds, setRsvpedIds] = useState(() => new Set());

  const queryClient = useQueryClient();

  /* ------------ Queries ------------ */
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await api.get("/events");
      return toArray(res.data);
    },
    retry: (count, err) => {
      const s = err?.response?.status;
      if (s === 401 || s === 403) return false;
      return count < 3;
    },
  });

  // Alumni: fetch my RSVPs to mark buttons as confirmed
  useQuery({
    queryKey: ["my-rsvps"],
    enabled: isAlumni,
    queryFn: async () => {
      const res = await api.get("/rsvps/mine");
      return toArray(res.data);
    },
    onSuccess: (list) => {
      const ids = new Set(
        list.map((r) => String(r?.eventId ?? r?.event?.id ?? 0))
      );
      setRsvpedIds(ids);
    },
  });

  /* ------------ Mutations ------------ */
  const createMutation = useMutation({
    mutationFn: async (payload) => (await api.post("/events", payload)).data,
    onSuccess: () => {
      toast.success("Event created.");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setCreateForm({
        title: "",
        description: "",
        eventDate: "",
        location: "",
      });
      setShowCreate(false);
    },
    onError: (err) => {
      const detail =
        err?.response?.data?.title ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create event.";
      toast.error(detail);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) =>
      (await api.put(`/events/${id}`, payload)).data,
    onSuccess: () => {
      toast.success("Event updated.");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setEditingId(null);
    },
    onError: (err) => {
      const detail =
        err?.response?.data?.title ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update event.";
      toast.error(detail);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/events/${id}`),
    onSuccess: () => {
      toast.success("Event deleted.");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err) => {
      const detail =
        err?.response?.data?.title ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete event.";
      toast.error(detail);
    },
  });

  const rsvpMutation = useMutation({
    mutationFn: async (eventId) => {
      const res = await api.post("/rsvps", { eventId: Number(eventId) });
      return res.data;
    },
    onSuccess: (_data, eventId) => {
      setRsvpedIds((prev) => {
        const next = new Set(prev);
        next.add(String(eventId));
        return next;
      });
      toast.success("RSVP confirmed!");
    },
    onError: (err) => {
      const status = err?.response?.status;
      const detail =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to RSVP.";
      if (status === 400) toast.error(detail);
      else toast.error(detail);
    },
  });

  /* ------------ Derived ------------ */
  const filteredEvents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => {
      const hay = [e?.title || "", e?.description || "", e?.location || ""]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [events, searchTerm]);

  // Valid if chosen time is **>= now IST**
  const createDateObj = parseLocalInput(createForm.eventDate);
  const createDateValid =
    !!createDateObj && createDateObj.getTime() >= nowInIST().getTime();

  const editDateObj = parseLocalInput(editForm.eventDate);
  const editDateValid =
    !editingId ||
    (!!editDateObj && editDateObj.getTime() >= nowInIST().getTime());

  /* ------------ Handlers ------------ */
  const submitCreate = (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    const payload = {
      title: createForm.title?.trim(),
      description: createForm.description?.trim(),
      eventDate: createForm.eventDate
        ? parseLocalInput(createForm.eventDate)?.toISOString()
        : null,
      location: createForm.location?.trim(),
    };

    if (!payload.title || !payload.eventDate) {
      toast.error("Title and Event Date are required.");
      return;
    }
    if (!createDateValid) {
      toast.error(
        `Event Date must be in the future (IST). Current time: ${minLabel}`
      );
      return;
    }

    createMutation.mutate(payload);
  };

  const startEdit = (ev) => {
    if (!isAdmin) return;
    setEditingId(ev.id);
    setEditForm({
      title: ev.title || "",
      description: ev.description || "",
      // Pre-fill using the event's existing time, but show in local (IST) for the input
      eventDate: toLocalInput(new Date(ev.eventDate)),
      location: ev.location || "",
    });
  };
  const cancelEdit = () => setEditingId(null);

  const submitEdit = (e) => {
    e.preventDefault();
    if (!isAdmin || !editingId) return;

    const payload = {
      title: editForm.title?.trim(),
      description: editForm.description?.trim(),
      eventDate: editForm.eventDate
        ? parseLocalInput(editForm.eventDate)?.toISOString()
        : null,
      location: editForm.location?.trim(),
    };

    if (!payload.title || !payload.eventDate) {
      toast.error("Title and Event Date are required.");
      return;
    }
    if (!editDateValid) {
      toast.error(
        `Event Date must be in the future (IST). Current time: ${minLabel}`
      );
      return;
    }

    updateMutation.mutate({ id: editingId, payload });
  };

  const confirmDelete = (id) => {
    if (!isAdmin) return;
    if (window.confirm("Delete this event? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleRsvp = (eventId) => {
    if (!isAlumni) return;
    if (!eventId || Number.isNaN(Number(eventId))) {
      toast.error("Invalid event. Please refresh.");
      return;
    }
    if (rsvpedIds.has(String(eventId))) return;
    rsvpMutation.mutate(eventId);
  };

  /* ------------ Render ------------ */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Discover upcoming alumni events
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreate((s) => !s)}>
            <Plus className="h-4 w-4 mr-2" />
            {showCreate ? "Close" : "New Event"}
          </Button>
        )}
      </div>

      {/* Admin: Create Event */}
      {isAdmin && showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create Event</CardTitle>
            <CardDescription>
              Events must be scheduled in the future. Current IST:{" "}
              <b>{minLabel}</b>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitCreate} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g., Annual Alumni Meetup"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={createForm.location}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, location: e.target.value }))
                  }
                  placeholder="Auditorium Hall A"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Event Date *</label>
                <Input
                  type="datetime-local"
                  value={createForm.eventDate}
                  min={minAttr} // block past (IST)
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, eventDate: e.target.value }))
                  }
                />
                {!createDateValid && createForm.eventDate && (
                  <p className="text-sm text-destructive mt-1">
                    Pick a future time (IST). Current: {minLabel}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Short description"
                />
              </div>
              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || !createDateValid}
                >
                  {createMutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => {
          const id = Number(event?.id ?? event?.eventId ?? 0);
          const when = new Date(event?.eventDate ?? "");
          const valid = !Number.isNaN(when.getTime());
          const isPast = valid && when.getTime() < nowInIST().getTime(); // compare vs IST "now"
          const isUpcoming = valid && when.getTime() >= nowInIST().getTime();
          const editingThis = editingId === id;
          const alreadyRsvped = rsvpedIds.has(String(id));

          return (
            <Card
              key={id || Math.random()}
              className={isPast ? "opacity-75" : ""}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {event.title || "Untitled Event"}
                  </CardTitle>
                  {isPast ? (
                    <Badge variant="secondary">Past</Badge>
                  ) : isUpcoming ? (
                    <Badge>Upcoming</Badge>
                  ) : (
                    <Badge variant="outline">Scheduled</Badge>
                  )}
                </div>
                {event.description && !editingThis && (
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* View mode */}
                {!editingThis && (
                  <>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {/* Show **Indian** time */}
                        <span>{formatIST(event?.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{event?.location || "TBA"}</span>
                      </div>
                    </div>

                    {/* Admin controls */}
                    {isAdmin && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => startEdit(event)}
                          disabled={updateMutation.isPending}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => confirmDelete(id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    )}

                    {/* Alumni RSVP */}
                    {isAlumni && !isPast && (
                      <div className="pt-2">
                        {alreadyRsvped ? (
                          <Button disabled className="w-full">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            RSVP Confirmed
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleRsvp(id)}
                            disabled={rsvpMutation.isPending || !id}
                            className="w-full"
                          >
                            {rsvpMutation.isPending ? "Processing..." : "RSVP"}
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Edit mode (Admin) */}
                {editingThis && isAdmin && (
                  <form onSubmit={submitEdit} className="grid gap-3">
                    <div>
                      <label className="text-sm font-medium">Title *</label>
                      <Input
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, title: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Location</label>
                      <Input
                        value={editForm.location}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            location: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Event Date *
                      </label>
                      <Input
                        type="datetime-local"
                        value={editForm.eventDate}
                        min={minAttr} // prevent setting to past (IST)
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            eventDate: e.target.value,
                          }))
                        }
                      />
                      {!editDateValid && editForm.eventDate && (
                        <p className="text-sm text-destructive mt-1">
                          Pick a future time (IST). Current: {minLabel}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={updateMutation.isPending || !editDateValid}
                        className="w-full"
                      >
                        {updateMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEdit}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!filteredEvents.length && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No events found</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Try adjusting your search criteria."
                : "Check back later for upcoming events."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
