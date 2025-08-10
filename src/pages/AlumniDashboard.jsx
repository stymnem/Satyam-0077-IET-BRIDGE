import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Briefcase, MessageCircle, User, Bell } from "lucide-react";

// normalize API arrays
function toArray(v) {
  return Array.isArray(v) ? v : v && Array.isArray(v.items) ? v.items : [];
}

// safe date -> short string
function safeDate(v) {
  const d = new Date(v);
  return isNaN(d.getTime()) ? "TBA" : d.toLocaleDateString();
}

export default function AlumniDashboard() {
  const navigate = useNavigate();

  const {
    data: announcements = [],
    isLoading: announcementsLoading,
    isError: announcementsError,
    error: announcementsErr,
  } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const res = await api.get("/announcements");
      return toArray(res.data);
    },
  });

  const {
    data: upcomingEvents = [],
    isLoading: eventsLoading,
    isError: eventsError,
    error: eventsErr,
  } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const res = await api.get("/events");
      const events = toArray(res.data);
      const now = Date.now();
      // your API uses `eventDate`
      return events
        .filter((e) => e?.eventDate && new Date(e.eventDate).getTime() > now)
        .slice(0, 3);
    },
  });

  const {
    data: jobStats = { total: 0, recent: 0 },
    isError: jobsError,
    error: jobsErr,
  } = useQuery({
    queryKey: ["job-stats"],
    queryFn: async () => {
      const res = await api.get("/jobpostings");
      const jobs = toArray(res.data);
      const recent = jobs.filter((j) => {
        const d = new Date(j.postedDate);
        return (
          !isNaN(d.getTime()) &&
          d.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        );
      }).length;
      return { total: jobs.length, recent };
    },
  });

  const anyError = announcementsError || eventsError || jobsError;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome Back!</h1>
        <p className="text-muted-foreground">
          Stay connected with the IETBRIGE alumni community
        </p>
      </div>

      {anyError && (
        <div className="rounded border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <div className="font-medium mb-1">Some data failed to load.</div>
          <pre className="whitespace-pre-wrap">
            {announcementsErr?.message ||
              eventsErr?.message ||
              jobsErr?.message}
          </pre>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">Future dates only</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobStats.recent}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">Recent updates</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access your most used features</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Button
            onClick={() => navigate("/profile")}
            variant="outline"
            className="h-20 flex flex-col"
          >
            <User className="h-6 w-6 mb-2" />
            Edit Profile
          </Button>
          <Button
            onClick={() => navigate("/jobs")}
            variant="outline"
            className="h-20 flex flex-col"
          >
            <Briefcase className="h-6 w-6 mb-2" />
            Browse Jobs
          </Button>
          <Button
            onClick={() => navigate("/messages")}
            variant="outline"
            className="h-20 flex flex-col"
          >
            <MessageCircle className="h-6 w-6 mb-2" />
            Inbox
          </Button>
          <Button
            onClick={() => navigate("/events")}
            variant="outline"
            className="h-20 flex flex-col"
          >
            <Calendar className="h-6 w-6 mb-2" />
            Events
          </Button>
        </CardContent>
      </Card>

      {/* Recent Announcements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Announcements</CardTitle>
            <CardDescription>Latest updates from the community</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/announcements")}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {announcementsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : announcements.length ? (
            <div className="space-y-4">
              {announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="border-l-4 border-primary pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    {a.isImportant && (
                      <Bell className="h-4 w-4 text-orange-500" />
                    )}
                    <h4 className="font-medium">{a.title}</h4>
                  </div>
                  {a.content && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {String(a.content).slice(0, 150)}...
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {safeDate(a.createdAt)}
                    {a.authorName ? ` • ${a.authorName}` : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No announcements available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Events you might be interested in</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/events")}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : upcomingEvents.length ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {safeDate(event.eventDate)} • {event.location || "TBA"}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => navigate("/events")}>
                    RSVP
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No upcoming events
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
