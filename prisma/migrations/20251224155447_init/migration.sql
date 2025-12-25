-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "status" "GameStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "secretKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamePlayer" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "seat" INTEGER NOT NULL,
    "finalTotal" INTEGER,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "wentOuts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GamePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "wentOutPlayerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoundScore" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "wentOut" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoundScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_name_key" ON "Player"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Player_slug_key" ON "Player"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Game_secretKey_key" ON "Game"("secretKey");

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayer_gameId_playerId_key" ON "GamePlayer"("gameId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayer_gameId_seat_key" ON "GamePlayer"("gameId", "seat");

-- CreateIndex
CREATE UNIQUE INDEX "Round_gameId_roundNumber_key" ON "Round"("gameId", "roundNumber");

-- CreateIndex
CREATE INDEX "RoundScore_gameId_playerId_idx" ON "RoundScore"("gameId", "playerId");

-- CreateIndex
CREATE INDEX "RoundScore_roundId_score_idx" ON "RoundScore"("roundId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "RoundScore_roundId_playerId_key" ON "RoundScore"("roundId", "playerId");

-- AddForeignKey
ALTER TABLE "GamePlayer" ADD CONSTRAINT "GamePlayer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlayer" ADD CONSTRAINT "GamePlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_wentOutPlayerId_fkey" FOREIGN KEY ("wentOutPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundScore" ADD CONSTRAINT "RoundScore_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundScore" ADD CONSTRAINT "RoundScore_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundScore" ADD CONSTRAINT "RoundScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
