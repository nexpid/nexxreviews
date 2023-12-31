import { createClient } from "@vercel/kv";

const kv = createClient({
  url: process.env.RKV_REST_API_URL!,
  token: process.env.RKV_REST_API_TOKEN!,
});

export interface UserState {
  suspended: boolean;
}

export async function getUserState(userId: string): Promise<UserState> {
  return (
    (await kv.json.get(`user-${userId}`)) ?? {
      suspended: false,
    }
  );
}

export async function suspendUser(userId: string, suspended: boolean) {
  try {
    return await kv.json.set(`user-${userId}`, "$.suspended", suspended);
  } catch {
    return await kv.json.set(`user-${userId}`, "$", {
      suspended,
    });
  }
}
