import { GameMode, TournamentBattlefield, TournamentFormat, TournamentStageType } from "@prisma/client";

export const GAME_MODE_OPTIONS: Array<{ value: GameMode; label: string; size: number }> = [
  { value: "SOLO_1V1", label: "1v1 Solo", size: 1 },
  { value: "DUO_2V2", label: "2v2 Duo", size: 2 },
  { value: "TRIO_3V3", label: "3v3 Trio", size: 3 },
  { value: "TEAM_5V5", label: "5v5 Squad", size: 5 },
];

export const TOURNAMENT_FORMAT_OPTIONS: Array<{ value: TournamentFormat; label: string }> = [
  { value: "SINGLE_ELIMINATION", label: "Single Elimination" },
  { value: "DOUBLE_ELIMINATION", label: "Double Elimination" },
  { value: "GAUNTLET", label: "Gauntlet" },
  { value: "BRACKET_GROUPS", label: "Bracket Groups" },
  { value: "CUSTOM_BRACKET", label: "Custom Bracket" },
  { value: "ROUND_ROBIN_GROUPS", label: "Round Robin Groups" },
  { value: "LEAGUE", label: "League" },
  { value: "SWISS_SYSTEM", label: "Swiss System" },
];

export const BATTLEFIELD_OPTIONS: Array<{ value: TournamentBattlefield; label: string }> = [
  { value: "ONLINE", label: "Online" },
  { value: "ONSITE", label: "Onsite" },
];

export const STAGE_TYPE_OPTIONS: Array<{ value: TournamentStageType; label: string }> = [
  { value: "SINGLE_STAGE", label: "Single Stage" },
  { value: "MULTIPLE_STAGES", label: "Multiple Stages" },
];

export const MATCH_MODE_SUGGESTIONS = [
  "Draft Pick",
  "Classic",
  "Brawl",
  "1v1 Mode",
  "Ranked",
  "Mirror",
  "Arcade",
  "Custom",
] as const;

export function getGameModeLabel(mode: GameMode) {
  return GAME_MODE_OPTIONS.find((option) => option.value === mode)?.label ?? mode.replaceAll("_", " ");
}

export function getRequiredRosterSize(mode: GameMode) {
  return GAME_MODE_OPTIONS.find((option) => option.value === mode)?.size ?? 1;
}

export function getTournamentFormatLabel(format: TournamentFormat) {
  return TOURNAMENT_FORMAT_OPTIONS.find((option) => option.value === format)?.label ?? format.replaceAll("_", " ");
}

export function getBattlefieldLabel(battlefield: TournamentBattlefield) {
  return BATTLEFIELD_OPTIONS.find((option) => option.value === battlefield)?.label ?? battlefield;
}

export function getStageTypeLabel(stageType: TournamentStageType) {
  return STAGE_TYPE_OPTIONS.find((option) => option.value === stageType)?.label ?? stageType.replaceAll("_", " ");
}

export function getStageSummary(stageType: TournamentStageType, stageCount: number) {
  if (stageType === "MULTIPLE_STAGES") {
    return `${stageCount} Stages`;
  }

  return "Single Stage";
}
