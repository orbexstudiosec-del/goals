"use client";

import { useState, useTransition } from "react";
import { reactPost } from "@/lib/actions";

export const EMOJIS = ["😂", "❤️", "😮", "🔥", "😢"] as const;

type Props = {
  postId: string;
  initialCounts: Record<string, number>;
  initialMine: string[];
};

export function ReactionBar({ postId, initialCounts, initialMine }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [mine, setMine] = useState<Set<string>>(new Set(initialMine));
  const [pending, startTransition] = useTransition();

  function toggle(emoji: string) {
    const active = mine.has(emoji);
    const nextMine = new Set(mine);
    const nextCounts = { ...counts };
    if (active) {
      nextMine.delete(emoji);
      nextCounts[emoji] = Math.max(0, (nextCounts[emoji] ?? 1) - 1);
    } else {
      nextMine.add(emoji);
      nextCounts[emoji] = (nextCounts[emoji] ?? 0) + 1;
    }
    setMine(nextMine);
    setCounts(nextCounts);

    startTransition(async () => {
      try {
        await reactPost(postId, emoji);
      } catch {
        setMine(mine);
        setCounts(counts);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {EMOJIS.map((emoji) => {
        const count = counts[emoji] ?? 0;
        const active = mine.has(emoji);
        return (
          <button
            key={emoji}
            type="button"
            disabled={pending}
            onClick={() => toggle(emoji)}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm transition ${
              active
                ? "border-brand-300 bg-brand-50"
                : "border-neutral-200 bg-white hover:bg-neutral-50"
            }`}
          >
            <span className="leading-none">{emoji}</span>
            {count > 0 && (
              <span className="text-xs font-semibold tabular-nums text-neutral-600">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
