import * as React from "react"

export function Avatar({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  return <div className={`inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted ${className}`}>{children}</div>;
}

export function AvatarImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img {...props} className={`h-full w-full object-cover`} />;
}

export function AvatarFallback({ children }: { children?: React.ReactNode }) {
  return <span className="text-sm font-medium text-foreground/80">{children}</span>;
}
