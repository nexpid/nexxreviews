import { createClient } from "@vercel/kv";
import { PendingReviewData, ReviewData } from "../types";
import { DiscordUser } from "../discord/authorization";

const kv = createClient({
  url: process.env.RKV_REST_API_URL!,
  token: process.env.RKV_REST_API_TOKEN!,
});

export async function getReviews() {
  return await kv.zrange<ReviewData[]>("reviews", 0, -1, { rev: true });
}

export async function getUserReview(userId: string): Promise<ReviewData> {
  return (
    await kv.zscan("reviews", 0, { match: `*"id":"${userId}"*`, count: 1 })
  )[1]?.[0] as any;
}

export async function editReview(user: DiscordUser, message: string) {
  const rev = await getUserReview(user.id);
  if (!rev) return;

  await kv.zrem("reviews", rev);
  rev.message = message;
  rev.author = user;
  rev.updatedAt = Date.now();
  await postReview(rev);
  return rev;
}

export async function updateReview(user: DiscordUser) {
  const rev = await getUserReview(user.id);
  if (!rev) return;

  await kv.zrem("reviews", rev);
  rev.author = user;
  await postReview(rev);
  return rev;
}

export async function deleteReview(userId: string) {
  const review = await getUserReview(userId);
  if (!review) return false;

  return await kv.zrem("reviews", review);
}

export async function postReview(review: ReviewData) {
  return await kv.zadd("reviews", {
    score: review.createdAt,
    member: review,
  });
}

export async function filterMessage(message: string) {
  return message.split(/\s+/g).join(" ").slice(0, 200);
}

export async function getPendingReview(
  userId: string
): Promise<PendingReviewData | null> {
  return await kv.get(`pending-${userId}`);
}

export async function deletePendingReview(userId: string) {
  return await kv.del(`pending-${userId}`);
}

export async function requestPendingReview(review: PendingReviewData) {
  return await kv.set(`pending-${review.author.id}`, review);
}
