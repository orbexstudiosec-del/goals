"use client";

import { useState, useTransition } from "react";
import { votePost, voteComment } from "@/lib/actions";

type Props = {
  id: string;
  initialScore: number;
  initialVote: number;
  kind?: "post" | "comment";
  layout?: "vertical" | "horizontal";
};

export function VoteButtons({
  id,
  initialScore,
  initialVote,
  kind = "post",
  layout = "vertical",
}: Props) {
  const [score, setScore] = useState(initialScore);
  const [myVote, setMyVote] = useState(initialVote);
  const [pending, startTransition] = useTransition();

  function cast(value: 1 | -1) {
    // Estado optimista
    const wasActive = myVote === value;
    const prevScore = score;
    const prevVote = myVote;
    const nextVote = wasActive ? 0 : value;
    setScore(score - myVote + nextVote);
    setMyVote(nextVote);

    startTransition(async () => {
      try {
        const res =
          kind === "comment"
            ? await voteComment(id, value)
            : await votePost(id, value);
        setScore(res.score);
        setMyVote(res.myVote);
      } catch {
        setScore(prevScore);
        setMyVote(prevVote);
      }
    });
  }

  const isVertical = layout === "vertical";

  return (
    <div
      className={
        isVertical
          ? "flex flex-col items-center gap-0.5"
          : "flex items-center gap-1"
      }
    >
      <button
        type="button"
        aria-label="Votar a favor"
        disabled={pending}
        onClick={() => cast(1)}
        className={`flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-accent/30 ${
          myVote === 1 ? "text-accent-600" : "text-neutral-400"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M12 4l8 10h-5v6H9v-6H4z" />
        </svg>
      </button>
      <span
        className={`min-w-[1.5rem] text-center text-sm font-bold tabular-nums ${
          myVote === 1
            ? "text-accent-600"
            : myVote === -1
              ? "text-neutral-800"
              : "text-neutral-700"
        }`}
      >
        {score}
      </span>
      <button
        type="button"
        aria-label="Votar en contra"
        disabled={pending}
        onClick={() => cast(-1)}
        className={`flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-neutral-100 ${
          myVote === -1 ? "text-neutral-800" : "text-neutral-400"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M12 20l-8-10h5V4h6v6h5z" />
        </svg>
      </button>
    </div>
  );
}
