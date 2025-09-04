import { createServerFn } from "@tanstack/react-start";

export type DatasetSummary = {
  id: string;
  species: string;
  images: number;
  provinces: number;
  lastUpdated: string;
};

export type ActivityLog = {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
};

export const getAnalytics = createServerFn("GET", async () => {
  // Mock/fake data - replace with your backend call
  const dataset: DatasetSummary[] = [
    { id: "1", species: "Water hyacinth", images: 241, provinces: 7, lastUpdated: "2025-08-31" },
    { id: "2", species: "Black wattle", images: 117, provinces: 6, lastUpdated: "2025-08-30" },
    { id: "3", species: "Pompom weed", images: 68, provinces: 5, lastUpdated: "2025-08-29" },
  ];

  const activity: ActivityLog[] = [
    { id: "a1", user: "Lerato", action: "uploaded", target: "12 images", timestamp: "2025-09-01T14:22:00Z" },
    { id: "a2", user: "Thabo", action: "commented", target: "Hyacinth thread", timestamp: "2025-09-01T13:10:00Z" },
    { id: "a3", user: "Naledi", action: "flagged", target: "Black wattle image", timestamp: "2025-09-01T12:55:00Z" },
  ];

  return { dataset, activity };
});
