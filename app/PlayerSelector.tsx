"use client";

import { useEffect, useMemo, useState } from "react";

type Player = { id: string; name: string; wins: number };

type Props = {
  players: Player[];
};

const STORAGE_KEY = "five-crowns-selected-players";

export default function PlayerSelector({ players }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return new Set();
    try {
      const names: string[] = JSON.parse(saved);
      return new Set(names);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selected)));
  }, [selected]);

  const filtered = useMemo(() => {
    if (!query.trim()) return players;
    const q = query.toLowerCase();
    return players.filter((p) => p.name.toLowerCase().includes(q));
  }, [players, query]);

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
    setQuery("");
  };

  const handleAddNew = () => {
    if (!query.trim()) return;
    toggle(query.trim());
  };

  return (
    <div className="space-y-3">
      {selected.size > 0 &&
        Array.from(selected).map((name) => (
          <input key={`hidden-${name}`} type="hidden" name="existingPlayer" value={name} />
        ))}
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddNew();
            }
          }}
          placeholder="Search players or type a new name and press Enter"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
        />
        <button
          type="button"
          onClick={handleAddNew}
          className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {selected.size === 0 ? (
          <span className="text-xs text-slate-500">No players selected yet.</span>
        ) : (
          Array.from(selected)
            .sort((a, b) => a.localeCompare(b))
            .map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
              >
                {name}
                <button
                  type="button"
                  onClick={() => toggle(name)}
                  className="text-[10px] font-bold text-white/80 hover:text-white"
                  aria-label={`Remove ${name}`}
                >
                  ×
                </button>
              </span>
            ))
        )}
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
                checked={selected.has(player.name)}
                onChange={() => toggle(player.name)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="flex-1">
                {player.name}{" "}
                <span className="text-xs text-slate-500">({player.wins} wins)</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
