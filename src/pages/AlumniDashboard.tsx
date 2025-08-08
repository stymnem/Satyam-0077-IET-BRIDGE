import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Briefcase,
  MessageCircle,
  User,
  Bell,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/lib/utils";
import api from "@/api/axios";
import type { Announcement, Event, Rsvp } from "@/types";

/**
 * Alumni dashboard – defensive against undefined data & incomplete objects.
 */
export default function AlumniDashboard() {
  const navigate = useNavigate();

  /* ---------------- announcements ---------------- */
  const { data: announcements = [], isLoading: announcementsLoading } =
    useQuery<Announcement[]>({
      queryKey: ["announcements"],
      queryFn: async () => {
        const { data } = await api.get<Announcement[]>("/announcements");
        return data ?? [];
      },
    });

  /* ---------------- upcoming events ---------------- */
  const { data: upcomingEvents = [], isLoading: eventsLoading } = useQuery<
    Event[]
  >({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const { data } = await api.get<Event[]>("/events");
      return (data ?? [])
        .filter(
          (e) =>
            e &&
            e.startDate &&
            new Date(e.startDate).getTime() > Date.now() &&
            e.id !== undefined
        )
        .slice(0, 3);
    },
  });

  /* ---------------- my RSVPs ---------------- */
  const { data: myRsvps = [] } = useQuery<Rsvp[]>({
    queryKey: ["my-rsvps"],
    queryFn: async () => {
      const { data } = await api.get<Rsvp[]>("/rsvps/mine");
      return data ?? [];
    },
  });

  /* ---------------- job stats ---------------- */
  const { data: jobStats = { total: 0, recent: 0 } } = useQuery({
    queryKey: ["job-stats"],
    queryFn: async () => {
      const { data } = await api.get<any[]>("/jobpostings");
      const jobs = data ?? [];
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return {
        total: jobs.length,
        recent: jobs.filter(
          (j) => j?.postedDate && new Date(j.postedDate).getTime() > weekAgo
        ).length,
      };
    },
  });

  /* ---------------- helpers ---------------- */
  const preview = (text: string | undefined) => (text ?? "").slice(0, 150);

  /* ---------------- render ---------------- */
  return (
    <div className="space-y-6">
      {/* ------------------------------------------------ header */}
      <header>
        <h1 className="text-3xl font-bold">Welcome Back!</h1>
        <p className="text-muted-foreground">
          Stay connected with the IETBRIGE alumni community
        </p>
      </header>

      {/* ---------------------------------------------- quick‑stats */}
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="My RSVPs"
          icon={Calendar}
          value={myRsvps.length}
          subtitle="Upcoming events"
        />
        <StatCard
          title="New Jobs"
          icon={Briefcase}
          value={jobStats.recent}
          subtitle="This week"
        />
        <StatCard
          title="Announcements"
          icon={Bell}
          value={announcements.length}
          subtitle="Recent updates"
        />
      </section>

      {/* ---------------------------------------------- quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access your most‑used features</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          {[
            { icon: User, label: "Edit Profile", to: "/profile" },
            { icon: Briefcase, label: "Browse Jobs", to: "/jobs" },
            { icon: MessageCircle, label: "Inbox", to: "/messages" },
            { icon: Calendar, label: "Events", to: "/events" },
          ].map(({ icon: Icon, label, to }) => (
            <Button
              key={label}
              variant="outline"
              className="h-20 flex flex-col"
              onClick={() => navigate(to)}
            >
              <Icon className="h-6 w-6 mb-2" />
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* ---------------------------------------------- recent announcements */}
      <Card>
        <CardHeader className="flex items-center justify-between">
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
            <SkeletonRows />
          ) : announcements.length ? (
            <div className="space-y-4">
              {announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="border-l-4 border-primary pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    {a.isImportant && (
                      <Bell className="h-4 w-4 text-orange-500" />
                    )}
                    <h4 className="font-medium">{a.title ?? "Untitled"}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {preview(a.content)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(a.createdAt)} • {a.authorName ?? "Unknown"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No announcements available" />
          )}
        </CardContent>
      </Card>

      {/* ---------------------------------------------- upcoming events */}
      <Card>
        <CardHeader className="flex items-center justify-between">
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
            <SkeletonRows />
          ) : upcomingEvents.length ? (
            <div className="space-y-4">
              {upcomingEvents.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{e.title ?? "Untitled"}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(e.startDate)} • {e.location ?? "TBA"}
                    </p>
                  </div>
                  {myRsvps.some((r) => r.eventId === e.id) ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/events/${e.id}`)}
                    >
                      RSVP
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No upcoming events" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- reusable sub‑components ---------------- */
function StatCard({
  title,
  icon: Icon,
  value,
  subtitle,
}: {
  title: string;
  icon: React.ComponentType<any>;
  value: number;
  subtitle: string;
}) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
function SkeletonRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-center text-muted-foreground py-4">{text}</p>;
}
