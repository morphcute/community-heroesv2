CREATE TYPE "TournamentBattlefield" AS ENUM ('ONLINE', 'ONSITE');

CREATE TYPE "TournamentStageType" AS ENUM ('SINGLE_STAGE', 'MULTIPLE_STAGES');

CREATE TYPE "TournamentFormat_new" AS ENUM (
    'SINGLE_ELIMINATION',
    'DOUBLE_ELIMINATION',
    'GAUNTLET',
    'BRACKET_GROUPS',
    'CUSTOM_BRACKET',
    'ROUND_ROBIN_GROUPS',
    'LEAGUE',
    'SWISS_SYSTEM'
);

ALTER TABLE "Tournament"
ADD COLUMN     "battlefield" "TournamentBattlefield" NOT NULL DEFAULT 'ONLINE',
ADD COLUMN     "matchMode" TEXT DEFAULT 'Draft Pick',
ADD COLUMN     "stageCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "stageType" "TournamentStageType" NOT NULL DEFAULT 'SINGLE_STAGE';

ALTER TABLE "Tournament"
ALTER COLUMN "format" TYPE "TournamentFormat_new"
USING (
    CASE
        WHEN "format"::text = 'ROUND_ROBIN' THEN 'ROUND_ROBIN_GROUPS'
        ELSE "format"::text
    END
)::"TournamentFormat_new";

DROP TYPE "TournamentFormat";

ALTER TYPE "TournamentFormat_new" RENAME TO "TournamentFormat";
