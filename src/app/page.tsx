import GoToReviews from "@/components/GoToReviews";
import ReviewHandler from "@/components/ReviewHandler";
import useAuthorization from "@/components/hooks/useAuthorization";
import { Button } from "@/components/shadcn/ui/button";
import { Separator } from "@/components/shadcn/ui/separator";
import { ArrowDownIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home",
};

export default async function Home() {
  const authorization = await useAuthorization();

  return (
    <>
      <div className="h-screen flex flex-col justify-center items-center">
        <h1 className="text-5xl font-extrabold pb-3">Nexx Reviews</h1>
        <h2 className="text-xl pb-5">
          Write what you think about me and have it featured on this website!
        </h2>
        <div className="flex flex-row gap-4">
          <Button asChild>
            <a href="#reviews">See Reviews</a>
          </Button>
          {!authorization?.state.suspended && (
            <Button asChild>
              <Link href="/review">Your Review</Link>
            </Button>
          )}
        </div>
      </div>
      <div
        className="h-screen w-full flex flex-col items-center pt-24 pb-0 md:pb-14"
        id="reviews"
      >
        <h1 className="text-5xl font-bold pb-3">Reviews</h1>
        <h2 className="text-xl pb-5">
          Here&apos;s a neat grid showing everyone&apos;s reviews:
        </h2>
        <Separator className="mb-3" />
        <ReviewHandler authorization={authorization} />
      </div>
      <GoToReviews />
    </>
  );
}
