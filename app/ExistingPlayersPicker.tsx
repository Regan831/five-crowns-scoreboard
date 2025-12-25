"use client";

import { useMemo, useState } from "react";

type Player = { id: string; name: string; wins: number };

type Props = {
  players: Player[];
};

export default function ExistingPlayersPicker({ players }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return players;
    const q = query.toLowerCase();
    return players.filter((p) => p.name.toLowerCase().includes(q));
  }, [players, query]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search players"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>
      <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2">
        {filtered.length === 0 && (
          <p className="px-2 py-3 text-xs text-slate-500">No matches.</p>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          {filtered.map((player) => (
            <label
              key={player.id}
              className="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-800"
            >
              <input
                type="checkbox"
                name="existingPlayer"
                value={player.name}
                onChange={() => setQuery("")}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              {player.name}{" "}
              <span className="text-xs text-slate-500">
                ({player.wins} wins)
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
