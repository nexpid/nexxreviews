"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "./shadcn/ui/scroll-area";
import Review from "./Review";
import { ReviewData } from "@/lib/types";
import { Authorization } from "@/lib/discord/authorization";

export default function ReviewHandler({
  authorization,
}: {
  authorization?: Authorization;
}) {
  const [data, setData] = useState<ReviewData[]>();

  useEffect(() => {
    const controller = new AbortController();

    try {
      fetch("/api/reviews?page=0", { signal: controller.signal })
        .then((d) =>
          d
            .json()
            .then((x) => setData(x))
            .catch(() => {})
        )
        .catch(() => {});
    } catch {}

    return () => controller.abort();
  }, []);

  return (
    <ScrollArea className="w-full h-full">
      <div className="w-full h-full grid xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 [grid-gap:.75rem]">
        {(data ?? new Array(9).fill(undefined)).map(
          (x: ReviewData | undefined, i) => (
            <Review data={x} authorization={authorization} key={i} />
          )
        )}
      </div>
    </ScrollArea>
  );
}
