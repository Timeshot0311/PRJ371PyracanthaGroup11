import { Hero } from "@/components/hero";
import { PageLayout } from "@/components/layouts/PageLayout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

export default function Home() {
  return (
    <PageLayout>
      <Hero />
    </PageLayout>
  );
}
