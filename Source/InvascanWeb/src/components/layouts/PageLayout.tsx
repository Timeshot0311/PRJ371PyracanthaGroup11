import { PropsWithChildren } from "react";

type PageLayoutProps = PropsWithChildren;

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-12xl px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
