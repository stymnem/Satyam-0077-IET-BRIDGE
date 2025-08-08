import { useState } from "react";
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
import {
  Search,
  MapPin,
  Calendar,
  ExternalLink,
  Building,
  Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import api from "@/api/axios";
import type { JobPosting } from "@/types";

/**
 * Jobs page – guarded against undefined fields so no runtime crashes.
 */
export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState("");

  /* ---------------- query ---------------- */
  const { data: jobs = [], isLoading } = useQuery<JobPosting[]>({
    queryKey: ["job-postings"],
    queryFn: async () => {
      const { data } = await api.get<JobPosting[]>("/jobpostings");
      return data ?? [];
    },
  });

  /* ---------------- utils ---------------- */
  const filteredJobs = jobs.filter((j) => {
    const t = searchTerm.toLowerCase();
    return (
      (j.title ?? "").toLowerCase().includes(t) ||
      (j.company ?? "").toLowerCase().includes(t) ||
      (j.location ?? "").toLowerCase().includes(t) ||
      (j.description ?? "").toLowerCase().includes(t)
    );
  });

  const getJobTypeColor = (jobType?: string) => {
    switch ((jobType ?? "").toLowerCase()) {
      case "full-time":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "part-time":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "contract":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "remote":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const isJobExpired = (deadline?: string) => {
    if (!deadline) return false;
    const d = new Date(deadline);
    return isNaN(d.getTime()) ? false : d.getTime() < Date.now();
  };

  /* ---------------- render ---------------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading job postings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Job Postings</h1>
        <p className="text-muted-foreground">
          Discover career opportunities from the alumni network
        </p>
      </header>

      {/* search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* list */}
      <div className="space-y-4">
        {filteredJobs.map((job) => {
          const expired = isJobExpired(job.applicationDeadline);

          return (
            <Card key={job.id} className={expired ? "opacity-75" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">
                      {job.title ?? "Untitled role"}
                    </CardTitle>
                    <CardDescription className="text-base">
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="h-4 w-4" />
                        {job.company ?? "Unknown"}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getJobTypeColor(job.jobType)}>
                      {job.jobType ?? "Other"}
                    </Badge>
                    {expired && <Badge variant="destructive">Expired</Badge>}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location ?? "TBA"}
                  </div>
                  {job.postedDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Posted {formatDate(job.postedDate)}
                    </div>
                  )}
                  {job.applicationDeadline && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Deadline: {formatDate(job.applicationDeadline)}
                    </div>
                  )}
                </div>

                {job.salaryRange && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium">Salary Range</p>
                    <p className="text-lg font-semibold text-green-600">
                      {job.salaryRange}
                    </p>
                  </div>
                )}

                <section>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {job.description}
                  </p>
                </section>

                <section>
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.requirements}
                  </p>
                </section>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    Contact: {job.contactEmail}
                  </span>
                  <Button disabled={expired} asChild>
                    <a
                      href={job.applyUrl ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {expired ? "Application Closed" : "Apply Now"}
                    </a>
                  </Button>
                </div>
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
                ? "Try adjusting your search criteria."
                : "Check back later for new opportunities."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
