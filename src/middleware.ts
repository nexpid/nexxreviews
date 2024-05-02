import { getAuthorization } from "@/lib/discord/authorization";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "./lib/cookies";
import { root } from "./lib/base";

const corsify = (res: NextResponse) => {
  res.headers.append("Access-Control-Allow-Origin", "*");
  return res;
};

export default async function middleware(req: NextRequest) {
  const auth = await getAuthorization(req.cookies.get("authorization")?.value);

  if (req.nextUrl.pathname === "/review")
    return auth
      ? corsify(NextResponse.next())
      : corsify(
          NextResponse.redirect(`${root(req)}oauth2/redirect?goTo=review`)
        );

  const res = corsify(NextResponse.next());
  if (auth)
    res.cookies.set({
      name: "authorization",
      value: await hash(JSON.stringify(auth)),
    });
  else res.cookies.delete("authorization");

  return res;
}
