import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, User, Trash2, Eye } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import api from "@/api/axios";
import { Message, MessageDto } from "@/types";

const messageSchema = z.object({
  receiverId: z.string().min(1, "Please select a recipient"),
  content: z.string().min(1, "Message content is required"),
});

type MessageForm = z.infer<typeof messageSchema>;

export default function Messages() {
  const [composeOpen, setComposeOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: inboxMessages, isLoading: inboxLoading } = useQuery({
    queryKey: ["messages", "inbox"],
    queryFn: async () => {
      const response = await api.get("/messages/inbox");
      return response.data as Message[];
    },
  });

  const { data: sentMessages, isLoading: sentLoading } = useQuery({
    queryKey: ["messages", "sent"],
    queryFn: async () => {
      const response = await api.get("/messages/sent");
      return response.data as Message[];
    },
  });

  // Mock users query for recipient selection
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      // In a real app, this would fetch from /api/users
      return [
        { id: "1", fullName: "suyash", email: "suyash@gmail.com" },
        { id: "2", fullName: "satyam", email: "satyam@gmail.com" },
        { id: "3", fullName: "nilesh", email: "nilesh@gmail.com" },
      ];
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageDto) => {
      const response = await api.post("/messages", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Message sent successfully");
      setComposeOpen(false);
      reset();
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await api.put(`/messages/${messageId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", "inbox"] });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await api.delete(`/messages/${messageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Message deleted");
    },
    onError: () => {
      toast.error("Failed to delete message");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
  });

  const onSubmit = (data: MessageForm) => {
    sendMessageMutation.mutate(data);
  };

  const handleMarkAsRead = (messageId: string) => {
    markAsReadMutation.mutate(messageId);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      deleteMessageMutation.mutate(messageId);
    }
  };

  const unreadCount = inboxMessages?.filter((msg) => !msg.isRead).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communicate with other alumni</p>
        </div>
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
                Send a message to another alumni member
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receiverId">Recipient</Label>
                <select
                  id="receiverId"
                  {...register("receiverId")}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="">Select recipient</option>
                  {users?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </select>
                {errors.receiverId && (
                  <p className="text-sm text-destructive">
                    {errors.receiverId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Message</Label>
                <Textarea
                  id="content"
                  {...register("content")}
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
                <Button type="submit" disabled={sendMessageMutation.isPending}>
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

        <TabsContent value="inbox" className="space-y-4">
          {inboxLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : inboxMessages?.length ? (
            <div className="space-y-2">
              {inboxMessages.map((message) => (
                <Card
                  key={message.id}
                  className={`${!message.isRead ? "border-primary/50" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {message.senderName}
                          </span>
                        </div>
                        {!message.isRead && (
                          <Badge variant="secondary">New</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatDateTime(message.sentAt)}
                        </span>
                        <div className="flex gap-1">
                          {!message.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(message.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{message.content}</p>
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

        <TabsContent value="sent" className="space-y-4">
          {sentLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : sentMessages?.length ? (
            <div className="space-y-2">
              {sentMessages.map((message) => (
                <Card key={message.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          To:
                        </span>
                        <span className="font-medium">
                          {message.receiverName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatDateTime(message.sentAt)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteMessage(message.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{message.content}</p>
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
