"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

const rounds = Array.from({ length: 11 }, (_, index) => index + 3);

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || `player-${randomBytes(4).toString("hex")}`;
}

function normalizeNames(input: string) {
  return input
    .split(/[\n,]+/)
    .map((name) => name.trim())
    .filter(Boolean);
}

export async function createGame(formData: FormData) {
  const namesInput = (formData.get("players") as string | null) ?? "";
  const existing =
    formData.getAll("existingPlayer")?.map((v) => String(v).trim()) ?? [];
  const names = normalizeNames(namesInput);

  const allNames = [...names, ...existing].filter(Boolean);
  const seen = new Set<string>();
  const uniqueNames = allNames.filter((name) => {
    const key = name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (uniqueNames.length < 2 || uniqueNames.length > 7) {
    throw new Error("Pick between 2 and 7 players for a game.");
  }

  const secretKey = randomBytes(12).toString("hex");
  const players = await Promise.all(
    uniqueNames.map(async (name, index) => {
      const slug = slugify(name);

      const player = await prisma.player.upsert({
        where: { slug },
        update: { name },
        create: { name, slug },
      });

      return { playerId: player.id, seat: index };
    }),
  );

  const game = await prisma.game.create({
    data: {
      secretKey,
      players: {
        create: players.map(({ playerId, seat }) => ({
          playerId,
          seat,
        })),
      },
      rounds: {
        create: rounds.map((roundNumber) => ({ roundNumber })),
      },
    },
    select: { id: true },
  });

  redirect(`/games/${game.id}?key=${secretKey}`);
}

export async function saveRoundScores(formData: FormData) {
  const gameId = (formData.get("gameId") as string | null) ?? "";
  const roundId = (formData.get("roundId") as string | null) ?? "";
  const providedKey = (formData.get("secretKey") as string | null) ?? "";
  const wentOutPlayerId =
    (formData.get("wentOutPlayerId") as string | null)?.trim() || null;

  if (!gameId || !roundId) {
    throw new Error("Missing game or round information.");
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { secretKey: true },
  });

  if (!game || game.secretKey !== providedKey) {
    throw new Error("Invalid or expired game key.");
  }

  const scoreEntries: { playerId: string; score: number }[] = [];

  formData.forEach((value, key) => {
    if (!key.startsWith("score-")) return;
    const playerId = key.replace("score-", "");
    const numericValue = Number(value);
    const score = Number.isFinite(numericValue) ? numericValue : 0;
    scoreEntries.push({ playerId, score });
  });

  await prisma.$transaction([
    prisma.round.update({
      where: { id: roundId },
      data: { wentOutPlayerId },
    }),
    ...scoreEntries.map(({ playerId, score }) =>
      prisma.roundScore.upsert({
        where: { roundId_playerId: { roundId, playerId } },
        update: { score, wentOut: playerId === wentOutPlayerId },
        create: {
          gameId,
          roundId,
          playerId,
          score,
          wentOut: playerId === wentOutPlayerId,
        },
      }),
    ),
  ]);

  const wentOutCounts = await prisma.round.groupBy({
    by: ["wentOutPlayerId"],
    where: { gameId, wentOutPlayerId: { not: null } },
    _count: true,
  });

  const wentOutWithPlayer = wentOutCounts.filter(
    (
      entry: (typeof wentOutCounts)[number],
    ): entry is (typeof wentOutCounts)[number] & { wentOutPlayerId: string } =>
      Boolean(entry.wentOutPlayerId),
  );

  await prisma.$transaction([
    prisma.gamePlayer.updateMany({
      where: { gameId },
      data: { wentOuts: 0 },
    }),
    ...wentOutWithPlayer.map((entry) =>
      prisma.gamePlayer.update({
        where: {
          gameId_playerId: {
            gameId,
            playerId: entry.wentOutPlayerId,
          },
        },
        data: { wentOuts: entry._count },
      }),
    ),
  ]);

  revalidatePath(`/games/${gameId}`);
}

export async function completeGame(formData: FormData) {
  const gameId = (formData.get("gameId") as string | null) ?? "";
  const providedKey = (formData.get("secretKey") as string | null) ?? "";

  if (!gameId) {
    throw new Error("Missing game information.");
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { secretKey: true },
  });

  if (!game || game.secretKey !== providedKey) {
    throw new Error("Invalid or expired game key.");
  }

  const totals = await prisma.roundScore.groupBy({
    by: ["playerId"],
    where: { gameId },
    _sum: { score: true },
  });

  const lowestScore = totals.length
    ? Math.min(
        ...totals.map((entry) => entry._sum.score ?? Number.POSITIVE_INFINITY),
      )
    : null;

  await prisma.$transaction([
    prisma.gamePlayer.updateMany({
      where: { gameId },
      data: { isWinner: false },
    }),
    ...totals.map((entry) =>
      prisma.gamePlayer.update({
        where: { gameId_playerId: { gameId, playerId: entry.playerId } },
        data: {
          finalTotal: entry._sum.score ?? 0,
          isWinner:
            lowestScore !== null && entry._sum.score === lowestScore
              ? true
              : false,
        },
      }),
    ),
    prisma.game.update({
      where: { id: gameId },
      data: { status: "COMPLETED", completedAt: new Date() },
    }),
  ]);

  revalidatePath(`/games/${gameId}`);
}
