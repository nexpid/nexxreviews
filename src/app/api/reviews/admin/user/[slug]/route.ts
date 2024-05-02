import { deleteReview } from "@/lib/data/reviews";
import { suspendUser } from "@/lib/data/users";
import { getAuthorization } from "@/lib/discord/authorization";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const authorization = await getAuthorization(
    req.cookies.get("authorization")?.value
  );
  if (!authorization)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!authorization.admin)
    return NextResponse.json({ error: "user is not admin" }, { status: 401 });

  const res = await suspendUser(params.slug, true);
  if (!res)
    return NextResponse.json({ error: "unknown error" }, { status: 500 });

  await deleteReview(params.slug);
  return NextResponse.json(res, { status: 200 });
}
