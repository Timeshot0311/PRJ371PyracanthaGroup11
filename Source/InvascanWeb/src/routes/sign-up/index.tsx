import { PageLayout } from "@/components/layouts/PageLayout";
import { SignUpForm } from "@/components/sign-up-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-up/")({
  component: SignUp,
});

function SignUp() {
  return (
    <PageLayout>
      <div className="w-full flex justify-center pt-16">
        <SignUpForm />
      </div>
    </PageLayout>
  );
}
