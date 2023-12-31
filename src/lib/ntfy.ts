import { api } from "./base";
import { makeAvatar } from "./discord/util";
import { PendingReviewData } from "./types";

export function sendPendingReview(review: PendingReviewData) {
  fetch(process.env.ntfy_server!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: process.env.ntfy_topic,
      title: "New Pending Review",
      message: `@${[review.author.username, review.author.discriminator]
        .filter((x) => !!x)
        .join("#")} (ID: ${review.author.id})\n\n${review.message}`,
      icon: makeAvatar(
        review.author.id,
        review.author.discriminator,
        review.author.avatar
      ),
      actions: [
        {
          action: "http",
          label: "Suspend & Deny",
          url: `${api()}reviews/admin/pending/${review.author.id}?suspend`,
          method: "DELETE",
          headers: {
            "X-Authorization": process.env.ntfy_admin_key,
          },
          clear: true,
        },
        {
          action: "http",
          label: "Deny",
          url: `${api()}reviews/admin/pending/${review.author.id}`,
          method: "DELETE",
          headers: {
            "X-Authorization": process.env.ntfy_admin_key,
          },
          clear: true,
        },
        {
          action: "http",
          label: "Post",
          url: `${api()}reviews/admin/pending/${review.author.id}`,
          method: "POST",
          headers: {
            "X-Authorization": process.env.ntfy_admin_key,
          },
          clear: true,
        },
      ],
    }),
  });
}
