"use client";

import { useConvexAuth } from "convex/react";
import type { ReactNode } from "react";

type ProtectedNavLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

export function ProtectedNavLink({
  href,
  className,
  children,
  ...props
}: ProtectedNavLinkProps) {
  const { isAuthenticated } = useConvexAuth();
  const target = isAuthenticated
    ? href
    : `/sign-in?next=${encodeURIComponent(href)}`;

  return (
    <a href={target} className={className} {...props}>
      {children}
    </a>
  );
}
