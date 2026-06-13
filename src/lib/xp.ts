export interface XPInput {
  participationsCount: number;
  awardsCount: number;
}

/**
 * Calculates user XP, current level, and progress percentage.
 * - Base XP: 350 (standard starter bonus for all members)
 * - Tournament registration: 200 XP
 * - Awards/Achievements: 150 XP
 */
export function calculateUserXP({ participationsCount, awardsCount }: XPInput) {
  const baseXP = 350;
  const participationsXP = participationsCount * 200;
  const awardsXP = awardsCount * 150;

  const totalXP = baseXP + participationsXP + awardsXP;

  // Each level requires 1000 XP
  const level = Math.floor(totalXP / 1000) + 1;
  const xpInCurrentLevel = totalXP % 1000;
  const xpNeededForNextLevel = 1000;
  const xpPercentage = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));

  return {
    totalXP,
    level,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    xpPercentage,
  };
}
