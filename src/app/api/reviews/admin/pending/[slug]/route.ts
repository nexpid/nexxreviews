import { sendNotification } from "@/lib/data/notifications";
import {
  deletePendingReview,
  getPendingReview,
  postReview,
} from "@/lib/data/reviews";
import { suspendUser } from "@/lib/data/users";
import { ReviewData } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const auth = req.headers.get("X-Authorization");
  if (auth !== process.env.ntfy_admin_key)
    return new NextResponse("unauthorized", { status: 401 });

  const existPendingReview = await getPendingReview(params.slug);
  if (!existPendingReview)
    return new NextResponse("nonexistent pending review", { status: 403 });

  await deletePendingReview(existPendingReview.author.id);
  const converted = existPendingReview as ReviewData;
  if ("pending" in converted) delete converted.pending;

  await postReview(converted);

  sendNotification(existPendingReview.author.id, {
    type: "pending-post",
    sent: Date.now(),
  });
  return new NextResponse("posted review");
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const auth = req.headers.get("X-Authorization");
  const suspend = req.nextUrl.searchParams.get("suspend") !== null;
  if (auth !== process.env.ntfy_admin_key)
    return new NextResponse("unauthorized", { status: 401 });

  const existPendingReview = await getPendingReview(params.slug);
  if (!existPendingReview)
    return new NextResponse("nonexistent pending review", { status: 403 });

  await deletePendingReview(existPendingReview.author.id);

  if (suspend) {
    await suspendUser(existPendingReview.author.id, true);
    sendNotification(existPendingReview.author.id, {
      type: "pending-deny",
      sent: Date.now(),
    });
    sendNotification(existPendingReview.author.id, {
      type: "suspended",
      sent: Date.now(),
    });
    return new NextResponse("denied review and suspended");
  } else {
    sendNotification(existPendingReview.author.id, {
      type: "pending-deny",
      sent: Date.now(),
    });
    return new NextResponse("denied review");
  }
}
