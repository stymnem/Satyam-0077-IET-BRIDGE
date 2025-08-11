import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Search,
  ChevronRight,
  RotateCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

// helpers
const toArray = (v) => (Array.isArray(v) ? v : v?.items ?? v?.$values ?? []);
const fmt = (d) => {
  const x = new Date(d);
  return Number.isNaN(x.getTime())
    ? "-"
    : x.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
};

export default function MyRsvps() {
  const { user } = useAuth();
  const role = (user?.role || "").toLowerCase();
  const isAdmin = role === "admin";
  const isAlumni = role === "alumni";
  const queryClient = useQueryClient();

  /* ---------------- Alumni: my RSVPs ---------------- */
  const {
    data: myRsvps = [],
    isLoading: myLoading,
    isError: myError,
    error: myErr,
  } = useQuery({
    queryKey: ["my-rsvps"],
    enabled: isAlumni,
    queryFn: async () => {
      const res = await api.get("/rsvps/mine");
      return toArray(res.data);
    },
    // 🔥 Always get fresh data when you land here
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

  /* ---------------- Admin: events + RSVPs by event ---------------- */
  const [filter, setFilter] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(null);

  const {
    data: events = [],
    isLoading: eventsLoading,
    isError: eventsError,
  } = useQuery({
    queryKey: ["events-for-rsvp"],
    enabled: isAdmin,
    queryFn: async () => {
      const res = await api.get("/events");
      return toArray(res.data);
    },
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const filteredEvents = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) =>
      [e?.title ?? "", e?.location ?? ""].join(" ").toLowerCase().includes(q)
    );
  }, [events, filter]);

  const {
    data: rsvpsByEvent = [],
    isLoading: byEventLoading,
    isError: byEventError,
    error: byEventErr,
  } = useQuery({
    queryKey: ["rsvps-by-event", selectedEventId],
    enabled: isAdmin && !!selectedEventId,
    queryFn: async () => {
      const res = await api.get(`/rsvps/by-event/${selectedEventId}`);
      return toArray(res.data);
    },
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: (count, err) => {
      const s = err?.response?.status;
      if (s === 401 || s === 403 || s === 404) return false;
      return count < 2;
    },
  });

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold">RSVPs</h1>
          <p className="text-muted-foreground">
            {isAlumni
              ? "Your confirmed event RSVPs."
              : "Browse events and view attendee lists."}
          </p>
        </div>

        {/* Manual refresh (handy if needed) */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (isAlumni)
              queryClient.invalidateQueries({ queryKey: ["my-rsvps"] });
            if (isAdmin) {
              queryClient.invalidateQueries({ queryKey: ["events-for-rsvp"] });
              if (selectedEventId) {
                queryClient.invalidateQueries({
                  queryKey: ["rsvps-by-event", selectedEventId],
                });
              }
            }
          }}
          title="Refresh"
        >
          <RotateCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Alumni view */}
      {isAlumni && (
        <>
          {myLoading ? (
            <SkeletonList />
          ) : myError ? (
            <ErrorBox title="Failed to load your RSVPs" error={myErr} />
          ) : myRsvps.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myRsvps.map((r, idx) => {
                const ev = r.Event || r.event || {};
                const key =
                  r.Id ??
                  r.id ??
                  `${r.eventId ?? ev.id ?? idx}-${
                    r.RSVPDate ?? r.rsvpDate ?? idx
                  }`;
                return (
                  <Card key={key}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {ev.Title || ev.title || "Event"}
                      </CardTitle>
                      <CardDescription>
                        RSVP’d on {fmt(r.RSVPDate || r.rsvpDate)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {fmt(ev.EventDate || ev.eventDate)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {ev.Location || ev.location || "TBA"}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <div className="font-medium mb-1">You haven’t RSVPed yet</div>
                <p className="text-sm text-muted-foreground">
                  Head to the Events page and RSVP to something you like.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Admin view */}
      {isAdmin && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* left: events list */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Events</CardTitle>
              <CardDescription>
                Select an event to view attendees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10"
                />
              </div>

              {eventsLoading ? (
                <SkeletonList small />
              ) : eventsError ? (
                <ErrorBox title="Failed to load events" />
              ) : filteredEvents.length ? (
                <div className="divide-y rounded-md border">
                  {filteredEvents.map((ev) => {
                    const id = ev.id ?? ev.Id;
                    const active = id === selectedEventId;
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedEventId(id)}
                        className={`w-full text-left px-3 py-2 hover:bg-muted/60 flex items-center justify-between ${
                          active ? "bg-primary/10" : ""
                        }`}
                      >
                        <div>
                          <div className="font-medium">{ev.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {fmt(ev.eventDate)}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No events found.
                </div>
              )}
            </CardContent>
          </Card>

          {/* right: attendees for selected */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Attendees</CardTitle>
              <CardDescription>
                {selectedEventId
                  ? "People who RSVPed to this event"
                  : "Select an event on the left"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedEventId ? (
                <div className="text-sm text-muted-foreground">
                  No event selected.
                </div>
              ) : byEventLoading ? (
                <SkeletonList />
              ) : byEventError ? (
                <ErrorBox
                  title="Failed to load RSVPs for event"
                  error={byEventErr}
                />
              ) : rsvpsByEvent.length ? (
                <div className="space-y-3">
                  {rsvpsByEvent.map((r) => (
                    <div
                      key={r.id ?? r.Id}
                      className="rounded-md border p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">
                          {r.FullName || r.fullName}{" "}
                          <Badge variant="secondary" className="ml-2">
                            {r.Email || r.email}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          RSVPed: {fmt(r.RSVPDate || r.rsvpDate)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        User ID: {r.UserId || r.userId}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No RSVPs yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function SkeletonList({ small = false }) {
  return (
    <div className={`grid gap-3 ${small ? "" : "md:grid-cols-2"}`}>
      {Array.from({ length: small ? 5 : 6 }).map((_, i) => (
        <div key={i} className="rounded-md border p-3 animate-pulse">
          <div className="h-4 w-2/3 bg-muted rounded mb-2" />
          <div className="h-3 w-1/3 bg-muted rounded" />
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
