/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/config/contracts.ts

export const CONTRACTS = {
  QUEST: import.meta.env.VITE_QUEST_CONTRACT || "CDRND7PWAF6UKEEUQR6KRECAZOERIIYHJ6LV7345YTKQ6EXCULVVAJG6",
  VERIFICATION: import.meta.env.VITE_VERIFICATION_CONTRACT || "CCKAPFUJKTY5EKWJIG5AKWASFOTZCJZUXHJVO73THPUGZNROQXCLP3GJ",
  BADGE: import.meta.env.VITE_BADGE_CONTRACT || "CBKINLELVYMKLD5GKBA5ANHOUWOAVXEW3AMHX762Z33GY6WLZTAHEYWT",
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  YIELD: import.meta.env.VITE_YIELD_CONTRACT || "CCW6NNSBEGJBS456GR62RWRD7TZ5VZUOVMGKDYAZH6RNDZWI2IEUC4YC",
  USDC: import.meta.env.VITE_USDC_ADDRESS || "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
};

// Quest types mapping
export enum QuestType {
  JobApplications = 0,
  InterviewPrep = 1,
  Networking = 2,
  SkillBuilding = 3,
}

export const QUEST_TYPE_LABELS: Record<QuestType, string> = {
  [QuestType.JobApplications]: "Job Applications",
  [QuestType.InterviewPrep]: "Interview Prep",
  [QuestType.Networking]: "Networking",
  [QuestType.SkillBuilding]: "Skill Building",
};

// Quest status mapping
export enum QuestStatus {
  Active = 0,
  Completed = 1,
  Failed = 2,
  Cancelled = 3,
}

// Duration configurations
export const DURATION_CONFIGS = [
  { days: 7, stake: 10_000_000, label: "1 Week Sprint", badge: "Bronze" },      // $10 USDC
  { days: 14, stake: 20_000_000, label: "2 Week Challenge", badge: "Silver" },  // $20 USDC
  { days: 30, stake: 50_000_000, label: "Monthly Mission", badge: "Gold" },     // $50 USDC
  { days: 90, stake: 100_000_000, label: "Quarter Quest", badge: "Platinum" },  // $100 USDC
];

// Helper to convert USDC stroop to dollar
export const stroopToUSDC = (stroop: bigint | string | number): number => {
  return Number(stroop) / 10_000_000;
};

// Helper to convert dollar to USDC stroop
export const usdcToStroop = (usdc: number): bigint => {
  return BigInt(Math.floor(usdc * 10_000_000));
};