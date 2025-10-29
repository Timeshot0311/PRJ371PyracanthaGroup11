import { PageLayout } from "@/components/layouts/PageLayout";
import { LoginForm } from "@/components/login-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login/")({
  component: Login,
});

function Login() {
  return (
    <PageLayout>
      <div className="w-full flex justify-center pt-16">
        <LoginForm />
      </div>
    </PageLayout>
  );
}
