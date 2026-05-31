"use client";

import { useState } from "react";
import { VoteButtons } from "@/components/VoteButtons";
import { CommentForm } from "@/components/CommentForm";
import { formatRelativeDate } from "@/lib/site";
import type { CommentNode } from "@/lib/posts";

type Props = {
  comment: CommentNode;
  postId: string;
  path: string;
  nickname: string;
  depth?: number;
};

export function CommentItem({ comment, postId, path, nickname, depth = 0 }: Props) {
  const [replying, setReplying] = useState(false);

  return (
    <div className={depth > 0 ? "ml-4 border-l-2 border-neutral-100 pl-3 sm:ml-6 sm:pl-4" : ""}>
      <div className="py-2">
        <div className="mb-1 flex items-center gap-2 text-xs text-neutral-500">
          <span className="font-semibold text-neutral-700">{comment.authorName}</span>
          <span aria-hidden>·</span>
          <span>{formatRelativeDate(comment.createdAt)}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
          {comment.body}
        </p>
        <div className="mt-1 flex items-center gap-3">
          <VoteButtons
            id={comment.id}
            initialScore={comment.score}
            initialVote={comment.myVote}
            kind="comment"
            layout="horizontal"
          />
          <button
            type="button"
            onClick={() => setReplying((v) => !v)}
            className="text-xs font-semibold text-neutral-500 hover:text-brand-600"
          >
            Responder
          </button>
        </div>

        {replying && (
          <CommentForm
            postId={postId}
            path={path}
            nickname={nickname}
            parentId={comment.id}
            compact
            label="Responder"
            placeholder="Escribe tu respuesta…"
            onDone={() => setReplying(false)}
          />
        )}
      </div>

      {comment.replies.length > 0 && (
        <div>
          {comment.replies.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              postId={postId}
              path={path}
              nickname={nickname}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
