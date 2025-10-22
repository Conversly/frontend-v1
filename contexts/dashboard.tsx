"use client";

import { AuthProvider } from "./auth";

export default function DashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <AuthProvider>
            {children}
    </AuthProvider>
  );
}
