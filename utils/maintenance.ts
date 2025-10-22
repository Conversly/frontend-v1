export function getMaintenanceInfo(): {
  isMaintenanceMode: boolean;
  formattedDate: string | null;
} {
  const maintenanceDateStr = process.env.NEXT_PUBLIC_MAINTENANCE_DATE;

  if (!maintenanceDateStr) {
    return {
      isMaintenanceMode: false,
      formattedDate: null,
    };
  }

  try {
    const maintenanceDate = new Date(maintenanceDateStr);

    if (isNaN(maintenanceDate.getTime())) {
      return {
        isMaintenanceMode: false,
        formattedDate: null,
      };
    }

    const now = new Date();
    const isMaintenanceMode = now < maintenanceDate;

    const formattedDate =
      maintenanceDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        hour12: false,
      }) + " UTC";

    return {
      isMaintenanceMode,
      formattedDate,
    };
  } catch (error) {
    return {
      isMaintenanceMode: false,
      formattedDate: null,
    };
  }
}

export function getAlphaMaintenanceInfo(): {
  isAlphaMaintenanceMode: boolean;
} {
  const maintenanceBoolean = process.env.NEXT_PUBLIC_ALPHA_MAINTENANCE_BOOLEAN;

  try {
    return {
      isAlphaMaintenanceMode: maintenanceBoolean === "true",
    };
  } catch (error) {
    return {
      isAlphaMaintenanceMode: false,
    };
  }
}
