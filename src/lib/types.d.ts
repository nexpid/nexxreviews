import { DiscordUser } from "./discord/authorization";

export interface ReviewData {
  author: DiscordUser;
  message: string;
  updatedAt?: number;
  createdAt: number;
}

export interface PendingReviewData extends ReviewData {
  pending: true;
}

export interface APINotification {
  type: "suspended" | "pending-post" | "pending-deny";
  sent: number;
}
