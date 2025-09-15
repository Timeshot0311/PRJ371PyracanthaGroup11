// src/queries/community-query-options.ts
import { queryOptions } from "@tanstack/react-query";
import * as Community from "@/services/community";
export const communityAllQuery = () =>
  queryOptions({
    queryKey: ["community", "all"],
    queryFn: Community.getAllFeedback,
    staleTime: 60_000,
  });

export const communityMineQuery = () =>
  queryOptions({
    queryKey: ["community", "mine"],
    queryFn: Community.getMyFeedback,
    staleTime: 60_000,
  });

export const feedbackCommentsQuery = (feedbackId: string) =>
  queryOptions({
    queryKey: ["community", "comments", feedbackId],
    queryFn: () => Community.getFeedbackComments(feedbackId),
    enabled: !!feedbackId,
    staleTime: 30_000,
  });

// Export mutations’ raw fns for your components
export const communityMutations = {
  postFeedback: Community.postFeedback,
  postFeedbackComment: Community.postFeedbackComment,
};
