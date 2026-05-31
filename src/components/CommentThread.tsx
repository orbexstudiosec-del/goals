import { CommentForm } from "@/components/CommentForm";
import { CommentItem } from "@/components/CommentItem";
import type { CommentNode } from "@/lib/posts";

type Props = {
  postId: string;
  path: string;
  nickname: string;
  comments: CommentNode[];
};

export function CommentThread({ postId, path, nickname, comments }: Props) {
  const total = countComments(comments);

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-extrabold text-neutral-900">
        {total} {total === 1 ? "comentario" : "comentarios"}
      </h2>

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <CommentForm postId={postId} path={path} nickname={nickname} />
      </div>

      <div className="mt-5 divide-y divide-neutral-100">
        {comments.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-500">
            Sé el primero en comentar 👀
          </p>
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              postId={postId}
              path={path}
              nickname={nickname}
            />
          ))
        )}
      </div>
    </section>
  );
}

function countComments(nodes: CommentNode[]): number {
  return nodes.reduce((acc, n) => acc + 1 + countComments(n.replies), 0);
}
