import { root } from "@/lib/base";
import { NextRequest, NextResponse } from "next/server";
import { states } from "../state";
import { makeAuthorization } from "@/lib/discord/authorization";
import { hash } from "@/lib/cookies";
import waitlist from "@/lib/waitlist";
import { updateReview } from "@/lib/data/reviews";

export async function GET(req: NextRequest) {
  const error = (msg: string) =>
    NextResponse.redirect(
      `${root()}oauth2/error?message=${encodeURIComponent(msg)}`
    );

  const state = req.nextUrl.searchParams.get("state"),
    code = req.nextUrl.searchParams.get("code");

  if (!state || !code) return error("Missing state or code");

  const goTo = states.get(state);
  if (!goTo) return error("Unknown state");
  states.delete(state);

  const auth = await makeAuthorization(code);
  if (!auth) return error("Failed to authorize");

  if (waitlist.enabled && !waitlist.list.includes(auth.user.id))
    return error("Not in the waitlist");

  const res = NextResponse.redirect(`${root()}${goTo ?? ""}`);
  await updateReview(auth.user);
  res.cookies.set({
    name: "authorization",
    value: await hash(JSON.stringify(auth)),
  });
  return res;
}
