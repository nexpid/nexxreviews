import { root } from "@/lib/base";
import { states } from "../state";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export function GET(req: NextRequest) {
  const state = randomBytes(10).toString("hex");
  states.set(state, req.nextUrl.searchParams.get("goTo") ?? "");

  const params = new URLSearchParams();
  params.append("response_type", "code");
  params.append("client_id", process.env.discord_client_id!);
  params.append("scope", "identify");
  params.append("state", state);
  params.append("redirect_uri", `${root()}oauth2/grant`);
  params.append("prompt", "none");

  const res = NextResponse.redirect(
    `https://discord.com/oauth2/authorize?${params.toString()}`
  );
  res.headers.set("Cache-Control", "no-store");
  return res;
}
