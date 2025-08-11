import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Mail, Send, User, Trash2, Eye } from "lucide-react";
import { formatDateTime, formatDateTimeIST } from "../lib/utils";
import api from "../api/axios";

/* tiny helper so it works whether API returns array or {items:[] } */
const toArray = (v) => (Array.isArray(v) ? v : v?.items ?? []);

export default function Messages() {
  const [composeOpen, setComposeOpen] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [live, setLive] = useState(true); // <-- LIVE polling toggle

  const queryClient = useQueryClient();

  // debounce recipient search ~300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(recipientSearch.trim()), 300);
    return () => clearTimeout(t);
  }, [recipientSearch]);

  // Refetch when tab becomes visible again
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") {
        queryClient.invalidateQueries({ queryKey: ["messages", "inbox"] });
        queryClient.invalidateQueries({ queryKey: ["messages", "sent"] });
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [queryClient]);

  // Polling intervals (frontend-only “real-time”)
  const inboxRefetchInterval = live ? 4000 : false;
  const sentRefetchInterval = live ? 10000 : false;

  const { data: inboxMessages = [], isLoading: inboxLoading } = useQuery({
    queryKey: ["messages", "inbox"],
    queryFn: async () => (await api.get("/messages/inbox")).data,
    refetchInterval: inboxRefetchInterval,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchIntervalInBackground: true,
  });

  const { data: sentMessages = [], isLoading: sentLoading } = useQuery({
    queryKey: ["messages", "sent"],
    queryFn: async () => (await api.get("/messages/sent")).data,
    refetchInterval: sentRefetchInterval,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchIntervalInBackground: true,
  });

  // REAL recipients from your backend (exclude self on server)
  const {
    data: recipients = [],
    isLoading: recipientsLoading,
    isError: recipientsError,
    error: recipientsErr,
  } = useQuery({
    queryKey: ["users", "recipients", debouncedSearch, "All"],
    queryFn: async () => {
      const res = await api.get("/users/recipients", {
        params: { q: debouncedSearch || undefined, role: "All", take: 20 },
      });
      return toArray(res.data);
    },
    staleTime: 30_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const sendMessageMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        receiverId: Number(data.receiverId),
        content: String(data.content || "").trim(),
      };
      if (!payload.receiverId || !payload.content) {
        throw new Error("Receiver and content are required.");
      }
      const res = await api.post("/messages", payload);
      return res.data;
    },
    onSuccess: (created) => {
      // Optimistic: add to Sent immediately
      queryClient.setQueryData(["messages", "sent"], (old = []) => [
        created,
        ...old,
      ]);
      queryClient.invalidateQueries({ queryKey: ["messages", "sent"] });
      toast.success("Message sent successfully");
      setComposeOpen(false);
      reset();
      setRecipientSearch("");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to send message";
      toast.error(msg);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId) => api.put(`/messages/${messageId}/read`),
    onMutate: async (messageId) => {
      // Optimistic update: set isRead = true locally
      await queryClient.cancelQueries({ queryKey: ["messages", "inbox"] });
      const prev = queryClient.getQueryData(["messages", "inbox"]);
      queryClient.setQueryData(["messages", "inbox"], (list = []) =>
        list.map((m) => (m.id === messageId ? { ...m, isRead: true } : m))
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["messages", "inbox"], ctx.prev);
      toast.error("Failed to mark as read");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", "inbox"] });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId) => api.delete(`/messages/${messageId}`),
    onMutate: async (messageId) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["messages", "inbox"] }),
        queryClient.cancelQueries({ queryKey: ["messages", "sent"] }),
      ]);
      const prevInbox = queryClient.getQueryData(["messages", "inbox"]);
      const prevSent = queryClient.getQueryData(["messages", "sent"]);
      queryClient.setQueryData(["messages", "inbox"], (list = []) =>
        list.filter((m) => m.id !== messageId)
      );
      queryClient.setQueryData(["messages", "sent"], (list = []) =>
        list.filter((m) => m.id !== messageId)
      );
      return { prevInbox, prevSent };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prevInbox)
        queryClient.setQueryData(["messages", "inbox"], ctx.prevInbox);
      if (ctx?.prevSent)
        queryClient.setQueryData(["messages", "sent"], ctx.prevSent);
      toast.error("Failed to delete message");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onSuccess: () => toast.success("Message deleted"),
  });

  const onSubmit = (data) => sendMessageMutation.mutate(data);
  const handleMarkAsRead = (id) => markAsReadMutation.mutate(id);
  const handleDeleteMessage = (id) => {
    if (confirm("Delete this message?")) deleteMessageMutation.mutate(id);
  };

  const unreadCount = inboxMessages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with other members
          </p>
          {!live && (
            <p className="text-xs text-muted-foreground mt-1">
              Live updates paused
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={live ? "default" : "outline"}
            onClick={() => setLive((v) => !v)}
            title={live ? "Pause live updates" : "Resume live updates"}
          >
            {live ? "Live: On" : "Live: Off"}
          </Button>

          {/* Compose dialog */}
          <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Compose
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Send Message</DialogTitle>
                <DialogDescription>
                  Send a message to another member
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Search recipients */}
                <div className="space-y-2">
                  <Label htmlFor="recipientSearch">Search recipient</Label>
                  <Input
                    id="recipientSearch"
                    placeholder="Type a name or email…"
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                  />
                </div>

                {/* Recipient select */}
                <div className="space-y-2">
                  <Label htmlFor="receiverId">Recipient</Label>
                  <select
                    id="receiverId"
                    {...register("receiverId", {
                      required: "Please select a recipient",
                    })}
                    className="w-full p-2 border border-input rounded-md bg-background"
                    disabled={recipientsLoading || recipientsError}
                  >
                    <option value="">
                      {recipientsLoading
                        ? "Loading…"
                        : recipientsError
                        ? recipientsErr?.message || "Failed to load recipients"
                        : recipients.length
                        ? "Select recipient"
                        : "No recipients found"}
                    </option>
                    {recipients.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName || "(No name)"} ({u.email})
                      </option>
                    ))}
                  </select>
                  {errors.receiverId && (
                    <p className="text-sm text-destructive">
                      {errors.receiverId.message}
                    </p>
                  )}
                </div>

                {/* Message body */}
                <div className="space-y-2">
                  <Label htmlFor="content">Message</Label>
                  <Textarea
                    id="content"
                    {...register("content", {
                      required: "Message content is required",
                    })}
                    placeholder="Type your message here..."
                    rows={4}
                  />
                  {errors.content && (
                    <p className="text-sm text-destructive">
                      {errors.content.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending
                      ? "Sending..."
                      : "Send Message"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setComposeOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inbox" className="relative">
            Inbox
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>

        {/* Inbox */}
        <TabsContent value="inbox" className="space-y-4">
          {inboxLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : inboxMessages.length ? (
            <div className="space-y-2">
              {inboxMessages.map((m) => (
                <Card
                  key={m.id}
                  className={!m.isRead ? "border-primary/50" : ""}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {m.senderName || m.sender?.fullName || "Unknown"}
                          </span>
                        </div>
                        {!m.isRead && <Badge variant="secondary">New</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {/* {formatDateTime(m.sentAt)} */}
                          {formatDateTimeIST(m.sentAt)}
                        </span>
                        <div className="flex gap-1">
                          {!m.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(m.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMessage(m.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{m.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No messages</h3>
                <p className="text-muted-foreground">
                  You don't have any messages yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sent */}
        <TabsContent value="sent" className="space-y-4">
          {sentLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : sentMessages.length ? (
            <div className="space-y-2">
              {sentMessages.map((m) => (
                <Card key={m.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          To:
                        </span>
                        <span className="font-medium">
                          {m.receiverName || m.receiver?.fullName || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {/* {formatDateTime(m.sentAt)} */}
                          {formatDateTimeIST(m.sentAt)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteMessage(m.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{m.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No sent messages</h3>
                <p className="text-muted-foreground">
                  Messages you send will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
