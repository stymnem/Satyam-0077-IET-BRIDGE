import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Users,
  Calendar,
  Briefcase,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

/* utils */
const toArray = (v) => (Array.isArray(v) ? v : v?.items ?? []);
const safeDate = (v) => {
  const d = new Date(v);
  return isNaN(d.getTime()) ? "TBA" : d.toLocaleDateString();
};
// IST formatter for RSVP times
const formatIST = (v) => {
  const d = new Date(v);
  if (isNaN(d.getTime())) return "—";
  return (
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d) + " IST"
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  // --- Mock stats (unchanged) ---
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => ({
      totalUsers: 150,
      totalEvents: 12,
      totalJobs: 45,
      unreadMessages: 8,
    }),
  });

  // ✅ Real alumni only — uses dedicated endpoint /api/users/recent-alumni
  const {
    data: recentUsers = [],
    isLoading: recentLoading,
    isError: recentError,
  } = useQuery({
    queryKey: ["recent-alumni"],
    queryFn: async () => {
      const res = await api.get("/users/recent-alumni", {
        params: { take: 5 },
      });
      const list = toArray(res.data);
      // normalize just in case the shape differs
      return list.map((u) => ({
        id: u.id ?? u.userId ?? u.Id,
        fullName: u.fullName ?? u.FullName ?? "—",
        email: u.email ?? u.Email ?? "—",
        role: u.role ?? u.Role ?? "Alumni",
        createdAt: u.createdAt ?? u.CreatedAt ?? null,
      }));
    },
    retry: 1,
  });

  // --- Events for RSVP viewer ---
  const {
    data: allEvents = [],
    isLoading: eventsLoading,
    isError: eventsError,
  } = useQuery({
    queryKey: ["events-all"],
    queryFn: async () => {
      const res = await api.get("/events");
      return toArray(res.data).sort(
        (a, b) => new Date(b.eventDate) - new Date(a.eventDate)
      );
    },
  });

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [live, setLive] = useState(true); // real-time toggle

  useEffect(() => {
    if (!selectedEventId && allEvents.length) {
      setSelectedEventId(allEvents[0].id);
    }
  }, [allEvents, selectedEventId]);

  // RSVPs for selected event (IST display + real-time refetch)
  const {
    data: attendees = [],
    isLoading: attendeesLoading,
    isError: attendeesError,
    error: attendeesErr,
  } = useQuery({
    queryKey: ["rsvps-by-event", selectedEventId],
    enabled: !!selectedEventId,
    queryFn: async () => {
      const res = await api.get(`/rsvps/by-event/${selectedEventId}`);
      // Keep only the minimal fields — name/email/date — from the API
      return toArray(res.data).map((a) => ({
        id: a.id,
        fullName: a.fullName ?? a.FullName ?? "—",
        email: a.email ?? a.Email ?? "—",
        rsvpDate: a.rsvpDate ?? a.RSVPDate,
      }));
    },
    refetchInterval: live ? 5000 : false,
    refetchOnWindowFocus: live,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, events, and content for the IETBRIGE community
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              3 upcoming this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Postings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalJobs}</div>
            <p className="text-xs text-muted-foreground">8 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              Pending admin review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button
            onClick={() => navigate("/users")}
            variant="outline"
            className="h-20 flex flex-col"
          >
            <Users className="h-6 w-6 mb-2" />
            Manage Users
          </Button>
          <Button
            onClick={() => navigate("/events")}
            variant="outline"
            className="h-20 flex flex-col"
          >
            <Calendar className="h-6 w-6 mb-2" />
            Event Manager
          </Button>
          <Button
            onClick={() => navigate("/jobs")}
            variant="outline"
            className="h-20 flex flex-col"
          >
            <Briefcase className="h-6 w-6 mb-2" />
            Job Postings
          </Button>
        </CardContent>
      </Card>

      {/* Event RSVPs (IST + real-time) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Event RSVPs</CardTitle>
            <CardDescription>
              See who responded to your events • Times shown in IST
              (Asia/Kolkata)
            </CardDescription>
          </div>
          <Button
            variant={live ? "default" : "outline"}
            onClick={() => setLive((v) => !v)}
            title={live ? "Pause live updates" : "Resume live updates"}
          >
            {live ? "Live: On" : "Live: Off"}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Event selector */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
            <label className="text-sm font-medium text-foreground">
              Select Event
            </label>
            <select
              className="
                w-full md:w-96 px-3 py-2 rounded-md
                border border-input bg-background text-foreground
                placeholder:text-muted-foreground
                shadow-sm
                focus:outline-none focus:ring-2 focus:ring-ring
                focus:ring-offset-2 focus:ring-offset-background
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              disabled={eventsLoading || eventsError || !allEvents.length}
              value={selectedEventId || ""}
              onChange={(e) => setSelectedEventId(Number(e.target.value))}
            >
              {allEvents.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} — {safeDate(e.eventDate)}
                  {e.location ? ` • ${e.location}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Attendees table — minimal fields only */}
          {attendeesLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse h-10 bg-muted rounded" />
              ))}
            </div>
          ) : attendeesError ? (
            <div className="rounded border border-destructive/40 bg-destructive/5 p-3 text-sm">
              <div className="font-medium mb-1">Failed to load RSVPs</div>
              <pre className="whitespace-pre-wrap">{attendeesErr?.message}</pre>
            </div>
          ) : attendees.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left border-b">
                  <tr>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2">RSVP Date (IST)</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((a) => (
                    <tr key={a.id} className="border-b last:border-b-0">
                      <td className="py-2 pr-4">{a.fullName}</td>
                      <td className="py-2 pr-4">{a.email}</td>
                      <td className="py-2">{formatIST(a.rsvpDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-2">
                Total RSVPs: {attendees.length}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No RSVPs yet for this event.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Users — real alumni only */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
          <CardDescription>
            Latest alumni who joined the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse h-12 bg-muted rounded" />
              ))}
            </div>
          ) : recentError ? (
            <p className="text-sm text-destructive">
              Failed to load recent alumni.
            </p>
          ) : recentUsers.length ? (
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.role}</p>
                    <p className="text-sm text-muted-foreground">
                      {safeDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent alumni yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
