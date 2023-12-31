import { getAuthorization } from "@/lib/discord/authorization";
import {
  deletePendingReview,
  deleteReview,
  editReview,
  getPendingReview,
  getReviews,
  getUserReview,
  postReview,
  requestPendingReview,
} from "@/lib/data/reviews";
import { PendingReviewData, ReviewData } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { sendPendingReview } from "@/lib/ntfy";

const pagination = 25;

export async function GET(req: NextRequest) {
  const rawPage = Number(req.nextUrl.searchParams.get("page"));
  const page = Number.isFinite(rawPage) ? Math.max(rawPage, 0) : 0;

  return NextResponse.json(
    (await getReviews()).slice(pagination * page, pagination * (page + 1))
  );
}

export async function POST(req: NextRequest) {
  const authorization = await getAuthorization(
    req.cookies.get("authorization")?.value
  );
  if (!authorization)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (authorization.state.suspended)
    return NextResponse.json({ error: "user is suspended" }, { status: 401 });

  const existReview = await getUserReview(authorization.user.id);
  if (existReview)
    return NextResponse.json(
      { error: "review already exists" },
      { status: 403 }
    );

  const existPendingReview = await getPendingReview(authorization.user.id);
  if (existPendingReview)
    return NextResponse.json(
      { error: "pending review already exists" },
      { status: 403 }
    );

  let body: { message: string };
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (typeof body.message !== "string")
    return NextResponse.json({ error: "incomplete body" }, { status: 400 });

  if (authorization.admin) {
    const review: ReviewData = {
      author: authorization.user,
      message: body.message,
      createdAt: Date.now(),
    };
    await postReview(review);
    return NextResponse.json(review);
  } else {
    const review: PendingReviewData = {
      author: authorization.user,
      message: body.message,
      createdAt: Date.now(),
      pending: true,
    };
    await requestPendingReview(review);
    sendPendingReview(review);

    return NextResponse.json(review);
  }
}

export async function PATCH(req: NextRequest) {
  const authorization = await getAuthorization(
    req.cookies.get("authorization")?.value
  );
  if (!authorization)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (authorization.state.suspended)
    return NextResponse.json({ error: "user is suspended" }, { status: 401 });
  if (!authorization.admin)
    return NextResponse.json({ error: "user is not admin" }, { status: 401 });

  const existReview = await getUserReview(authorization.user.id);
  if (!existReview)
    return NextResponse.json({ error: "no existing review" }, { status: 403 });

  let body: { message: string };
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (typeof body.message !== "string")
    return NextResponse.json({ error: "incomplete body" }, { status: 400 });

  const res = await editReview(authorization.user, body.message);
  return NextResponse.json(res ?? { error: "unknown error" }, {
    status: res ? 200 : 500,
  });
}

export async function DELETE(req: NextRequest) {
  const authorization = await getAuthorization(
    req.cookies.get("authorization")?.value
  );
  if (!authorization)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (authorization.state.suspended)
    return NextResponse.json({ error: "user is suspended" }, { status: 401 });

  const pending = req.nextUrl.searchParams.get("prefer_pending");
  if (pending !== null) {
    const res = await deletePendingReview(authorization.user.id);
    return NextResponse.json(res ?? { error: "unknown error" }, {
      status: res ? 200 : 500,
    });
  } else {
    const res = await deleteReview(authorization.user.id);
    if (res === false)
      return NextResponse.json(
        { error: "no existing review" },
        { status: 403 }
      );

    return NextResponse.json(res ?? { error: "unknown error" }, {
      status: res ? 200 : 500,
    });
  }
}
