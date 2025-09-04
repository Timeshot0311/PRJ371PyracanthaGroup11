import { createServerFn } from "@tanstack/react-start";

export type CommunityPost = {
    id: string;
    author: string;
    avatar?: string;
    content: string;
    tags: string[];
    createdAt: string;
    likes: number;
    comments: number;
    location?: string;
};

export const $getCommunityFeed = createServerFn({ method: "GET" }).handler(async () => {
    const feed: CommunityPost[] = [
        {
            id: "p1",
            author: "Tumi",
            content: "Spotted dense patches of water hyacinth near Hartbeespoort Dam. Uploading images for verification.",
            tags: ["water-hyacinth", "northwest"],
            createdAt: new Date().toISOString(),
            likes: 14,
            comments: 5,
            location: "Hartbeespoort, NW",
        },
        {
            id: "p2",
            author: "Ayesha",
            content: "Are these seedlings black wattle or silver wattle? Need ID help.",
            tags: ["id-help", "black-wattle"],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            likes: 9,
            comments: 3,
            location: "Stellenbosch, WC",
        },
        {
            id: "p3",
            author: "Sibusiso",
            content: "Cleared 30% of the patch this weekend. Sharing before/after pics.",
            tags: ["removal", "success-story"],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
            likes: 22,
            comments: 7,
            location: "uMngeni, KZN",
        }
    ];
    return { feed };
});