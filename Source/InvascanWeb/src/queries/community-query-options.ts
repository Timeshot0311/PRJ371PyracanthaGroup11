// src/queries/community-query-options.ts
import { queryOptions } from "@tanstack/react-query";
import {
  getAllFeedback,
  getMyFeedback,
  getFeedbackComments,
  postFeedback,
  postFeedbackComment,
} from "@/services/community";

export const communityAllQuery = () =>
  queryOptions({
    queryKey: ["community", "all"],
    queryFn: getAllFeedback,
    staleTime: 60_000,
  });

export const communityMineQuery = () =>
  queryOptions({
    queryKey: ["community", "mine"],
    queryFn: getMyFeedback,
    staleTime: 60_000,
  });

export const feedbackCommentsQuery = (feedbackId: string) =>
  queryOptions({
    queryKey: ["community", "comments", feedbackId],
    queryFn: () => getFeedbackComments(feedbackId),
    enabled: !!feedbackId,
    staleTime: 30_000,
  });

// Export mutations’ raw fns for your components
export const communityMutations = {
  postFeedback,
  postFeedbackComment,
};
