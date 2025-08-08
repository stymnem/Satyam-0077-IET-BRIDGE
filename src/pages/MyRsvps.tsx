import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Search } from "lucide-react";
import api from "@/api/axios";
import { useNavigate } from "react-router-dom";
import type { Rsvp, Event } from "@/types";

/* ---------- tiny safe date formatter ---------- */
const fmt = (v?: string | number | Date) => {
  const d = new Date(v ?? "");
  return isNaN(d.getTime())
    ? "TBA"
    : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

export default function MyRsvps() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  /* Fetch my RSVPs */
  const { data: rsvps = [], isLoading: rsvpsLoading } = useQuery<Rsvp[]>({
    queryKey: ["my-rsvps"],
    queryFn: async () => {
      const { data } = await api.get<Rsvp[]>("/rsvps/mine");
      return data ?? [];
    },
  });

  /* Fetch events so we can show titles, dates, etc. */
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: async () => {
      const { data } = await api.get<Event[]>("/events");
      return data ?? [];
    },
  });

  const eventsById = useMemo(() => {
    const m = new Map<number | string, Event>();
    for (const e of events) m.set(e.id, e);
    return m;
  }, [events]);

  const rows = useMemo(() => {
    const t = search.toLowerCase();
    return rsvps
      .map((r) => {
        const ev = eventsById.get(r.eventId);
        return { rsvp: r, event: ev };
      })
      .filter(({ event }) => {
        if (!event) return false;
        return (
          event.title?.toLowerCase().includes(t) ||
          event.description?.toLowerCase().includes(t) ||
          event.location?.toLowerCase().includes(t)
        );
      });
  }, [rsvps, eventsById, search]);

  if (rsvpsLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <header>
        <h1 className="text-3xl font-bold">My RSVPs</h1>
        <p className="text-muted-foreground">Events you’ve signed up for</p>
      </header>

      {/* search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your RSVPs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* list */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ rsvp, event }) => {
          if (!event) return null; // defensive
          const isPast = new Date(event.eventDate ?? "").getTime() < Date.now();

          return (
            <Card
              key={rsvp.id ?? `${rsvp.eventId}-${rsvp.createdAt ?? ""}`}
              className={isPast ? "opacity-75" : ""}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {event.title ?? `Event #${event.id}`}
                  </CardTitle>
                  <Badge variant={isPast ? "secondary" : "default"}>
                    {isPast ? "Past" : "Upcoming"}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {event.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{fmt(event.eventDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.location ?? "TBA"}</span>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button variant="outline" onClick={() => navigate("/events")}>
                    Open Events
                  </Button>
                  {/* If you add a detail route later, use: navigate(`/events/${event.id}`) */}
                </div>

                {rsvp.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    RSVPed on {fmt(rsvp.createdAt)}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!rows.length && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No RSVPs yet</h3>
            <p className="text-muted-foreground mb-4">
              Explore events and RSVP to see them here.
            </p>
            <Button onClick={() => navigate("/events")}>Browse Events</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
