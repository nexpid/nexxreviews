import { getAuthorization } from "@/lib/discord/authorization";
import { cookies } from "next/headers";

export default async function useAuthorization() {
  return await getAuthorization(cookies().get("authorization")?.value);
}
