"use client";

import type { ReactNode } from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
};

/** Hover tilt disabled — keeps API for existing imports */
export function TiltCard({ children, className = "" }: TiltCardProps) {
  return <div className={`relative h-full ${className}`}>{children}</div>;
}
