import { prisma } from "@/lib/prisma";
import { getAnonToken } from "@/lib/identity";
import type { Prisma, PostType } from "@prisma/client";

export type Orden = "nuevo" | "top";

export function parseOrden(value: string | undefined): Orden {
  return value === "top" ? "top" : "nuevo";
}

function orderBy(orden: Orden): Prisma.PostOrderByWithRelationInput[] {
  if (orden === "top") {
    return [{ pinned: "desc" }, { score: "desc" }, { createdAt: "desc" }];
  }
  return [{ pinned: "desc" }, { createdAt: "desc" }];
}

const listSelect = {
  id: true,
  type: true,
  slug: true,
  title: true,
  body: true,
  imageUrl: true,
  imageWidth: true,
  imageHeight: true,
  authorName: true,
  score: true,
  commentCount: true,
  createdAt: true,
  category: { select: { name: true, slug: true, color: true } },
  reactions: { select: { emoji: true, voterToken: true } },
} satisfies Prisma.PostSelect;

export type PostListItem = Prisma.PostGetPayload<{ select: typeof listSelect }> & {
  myVote: number;
  reactionCounts: Record<string, number>;
  myReactions: string[];
};

function decorate(
  post: Prisma.PostGetPayload<{ select: typeof listSelect }>,
  token: string | null,
  myVote: number,
): PostListItem {
  const reactionCounts: Record<string, number> = {};
  const myReactions: string[] = [];
  for (const r of post.reactions) {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] ?? 0) + 1;
    if (token && r.voterToken === token) myReactions.push(r.emoji);
  }
  return { ...post, myVote, reactionCounts, myReactions };
}

export async function listPosts(opts: {
  type?: PostType;
  orden?: Orden;
  take?: number;
  skip?: number;
}): Promise<PostListItem[]> {
  const token = await getAnonToken();
  const orden = opts.orden ?? "nuevo";

  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      ...(opts.type ? { type: opts.type } : {}),
    },
    orderBy: orderBy(orden),
    take: opts.take ?? 24,
    skip: opts.skip ?? 0,
    select: {
      ...listSelect,
      votes: token
        ? { where: { voterToken: token }, select: { value: true } }
        : false,
    },
  });

  return posts.map((p) => {
    const { votes, ...rest } = p as typeof p & { votes?: { value: number }[] };
    const myVote = votes?.[0]?.value ?? 0;
    return decorate(rest, token, myVote);
  });
}

export type CommentNode = {
  id: string;
  body: string;
  authorName: string;
  score: number;
  createdAt: Date;
  myVote: number;
  replies: CommentNode[];
};

export type PostDetail = PostListItem & { comments: CommentNode[] };

export async function getPostBySlug(
  slug: string,
  type: PostType,
): Promise<PostDetail | null> {
  const token = await getAnonToken();

  const post = await prisma.post.findFirst({
    where: { slug, type, status: "PUBLISHED" },
    select: {
      ...listSelect,
      votes: token
        ? { where: { voterToken: token }, select: { value: true } }
        : false,
      comments: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          authorName: true,
          score: true,
          createdAt: true,
          parentId: true,
          commentVotes: token
            ? { where: { voterToken: token }, select: { value: true } }
            : false,
        },
      },
    },
  });

  if (!post) return null;

  const { votes, comments, ...rest } = post as typeof post & {
    votes?: { value: number }[];
    comments: Array<{
      id: string;
      body: string;
      authorName: string;
      score: number;
      createdAt: Date;
      parentId: string | null;
      commentVotes?: { value: number }[];
    }>;
  };

  const base = decorate(rest, token, votes?.[0]?.value ?? 0);
  return { ...base, comments: buildCommentTree(comments) };
}

function buildCommentTree(
  flat: Array<{
    id: string;
    body: string;
    authorName: string;
    score: number;
    createdAt: Date;
    parentId: string | null;
    commentVotes?: { value: number }[];
  }>,
): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const c of flat) {
    map.set(c.id, {
      id: c.id,
      body: c.body,
      authorName: c.authorName,
      score: c.score,
      createdAt: c.createdAt,
      myVote: c.commentVotes?.[0]?.value ?? 0,
      replies: [],
    });
  }

  for (const c of flat) {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
