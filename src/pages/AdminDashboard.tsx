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
  Users,
  Calendar,
  Briefcase,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Mock queries for dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // These would be real API calls in production
      return {
        totalUsers: 150,
        totalEvents: 12,
        totalJobs: 45,
        unreadMessages: 8,
      };
    },
  });

  const { data: recentUsers } = useQuery({
    queryKey: ["recent-users"],
    queryFn: async () => {
      // Mock recent users data
      return [
        {
          id: "1",
          fullName: "John Doe",
          email: "john@example.com",
          role: "Alumni",
          createdAt: "2024-01-15",
        },
        {
          id: "2",
          fullName: "Jane Smith",
          email: "jane@example.com",
          role: "Alumni",
          createdAt: "2024-01-14",
        },
        {
          id: "3",
          fullName: "Mike Johnson",
          email: "mike@example.com",
          role: "Alumni",
          createdAt: "2024-01-13",
        },
      ];
    },
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

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
          <CardDescription>
            Latest users who joined the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUsers?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{user.role}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.createdAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
