export const TOTAL_WEIGHT = 100;

export const TIME_PERIODS = ["1d", "7d", "30d", "max"] as const;
export type TimePeriod = (typeof TIME_PERIODS)[number];

export const MAX_WALLET_ACCOUNTS_LIMIT = 5;

export const MAX_BLACKLIST_ITEMS = 1000;