"use client";

import { Toaster } from "@/components/ui/sonner";
import QueryClientProvider from "@/contexts/query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

export default function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Uncomment and add proper imports when needed
  // useEffect(() => {
  //   createClient({
  //     baseApiUrl: MAINNET_RELAY_API,
  //     source: "trench.ag",
  //     chains: CHAINS as any,
  //   });
  // }, []);

  return (
    <QueryClientProvider>
      <Suspense>
        <NuqsAdapter>
          <Toaster />
          {children}
        </NuqsAdapter>
      </Suspense>
    </QueryClientProvider>
  );
}
