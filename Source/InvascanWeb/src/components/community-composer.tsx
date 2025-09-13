// src/components/community-composer.tsx
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Textarea from "./ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postFeedback } from "@/services/community";
import { toast } from "sonner";

export function CommunityComposer() {
  const qc = useQueryClient();
  const [text, setText] = React.useState("");
  const [rating, setRating] = React.useState<string>("5");
  const creating = useMutation({
    mutationFn: async () => {
      if (!text.trim()) throw new Error("Please write something.");
      return postFeedback({ Comments: text.trim(), Ratings: Number(rating) || 0 });
    },
    onSuccess() {
      setText("");
      setRating("5");
      toast.success("Posted!");
     qc.invalidateQueries({ queryKey: ["community", "all"] });
     qc.invalidateQueries({ queryKey: ["community", "mine"] });

    },
    onError(err: any) {
      toast.error(err?.message || "Failed to post");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Share an update</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Textarea
          placeholder="What's happening in your area?"
          value={text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
          rows={3}
        />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rating</span>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger className="w-20">
                <SelectValue placeholder="0" />
              </SelectTrigger>
              <SelectContent>
                {[0,1,2,3,4,5].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={() => creating.mutate()} disabled={creating.isPending}>
            {creating.isPending ? "Posting…" : "Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
