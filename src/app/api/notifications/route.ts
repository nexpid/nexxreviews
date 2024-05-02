import {
  clearUserNotifications,
  getUserNotifications,
} from "@/lib/data/notifications";
import { getAuthorization } from "@/lib/discord/authorization";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authorization = await getAuthorization(
    req.cookies.get("authorization")?.value
  );
  if (!authorization)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const notifs = getUserNotifications(authorization.user.id);
  if (notifs.length) clearUserNotifications(authorization.user.id);

  return NextResponse.json(notifs);
}
