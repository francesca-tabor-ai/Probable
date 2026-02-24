export interface DunningRule {
  retryDay: number; // Days after first failure
  emailTemplate: string;
  action?: "retry" | "cancel";
}

export const DEFAULT_DUNNING_RULES: DunningRule[] = [
  { retryDay: 3, emailTemplate: "dunning_reminder_1", action: "retry" },
  { retryDay: 7, emailTemplate: "dunning_reminder_2", action: "retry" },
  { retryDay: 14, emailTemplate: "dunning_final", action: "cancel" },
];

export function getDunningRuleForRetryCount(
  retryCount: number,
  rules: DunningRule[] = DEFAULT_DUNNING_RULES
): DunningRule | null {
  return rules[retryCount] ?? null;
}
