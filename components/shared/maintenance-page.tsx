"use client";

import { getMaintenanceInfo } from "@/utils/maintenance";
import Image from "next/image";

export default function MaintenancePage({
  title = "Trench is temporarily unavailable",
  description = "We're performing essential maintenance to improve your trading experience. Our team is working to restore full functionality as quickly as possible.",
  customMessage,
  formattedDate,
  wholePlatform = false,
}: {
  title?: string;
  description?: string;
  customMessage?: string;
  formattedDate?: string;
  wholePlatform?: boolean;
}) {
  return (
    <div className="flex h-svh flex-1 items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8 text-center">
        {
          wholePlatform ? (
            <div className="mx-auto">
              <Image
                src="/logos/trench-wordmark.svg"
                alt="Trench"
                width={200}
                height={60}
                className="mx-auto"
              />
            </div>
          ) : (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-foreground-warning/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground-warning">
                <span className="text-2xl font-bold text-foreground-dark">!</span>
              </div>
            </div>
          )
        }

        <div className="space-y-4">
          <h1 className="text-xl font-medium text-foreground-light">
            {title}
          </h1>
          <p className="leading-relaxed text-foreground-medium">
            {description}
          </p>
          <p className="text-lg font-medium text-foreground-light">
            {customMessage || formattedDate ? `Trench will be back online at ${formattedDate}` : null}
          </p>
        </div>
      </div>
    </div>
  );
}