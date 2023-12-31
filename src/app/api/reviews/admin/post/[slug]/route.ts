import { deleteReview } from "@/lib/data/reviews";
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

  const res = await deleteReview(params.slug);
  if (res === false)
    return NextResponse.json({ error: "no existing review" }, { status: 403 });

  return NextResponse.json(res ?? { error: "unknown error" }, {
    status: res ? 200 : 500,
  });
}
