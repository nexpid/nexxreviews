import useAuthorization from "@/components/hooks/useAuthorization";
import { getPendingReview, getUserReview } from "@/lib/data/reviews";
import Main from "./Main";
import Fallback from "./Fallback";

export default async function Page() {
  const authorization = await useAuthorization();
  if (!authorization) return;

  const [review, pending] = await Promise.all([
    await getUserReview(authorization.user.id),
    await getPendingReview(authorization.user.id),
  ]);

  return authorization.state.suspended ? (
    <Fallback />
  ) : (
    <Main
      val={review?.message}
      pending={pending?.message}
      admin={authorization.admin}
    />
  );
}
