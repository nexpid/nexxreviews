"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const content = (suspended: boolean) =>
  [
    {
      title: "Home",
      href: "/",
    },
    !suspended && {
      title: "Your Review",
      href: "/review",
    },
    {
      title: "GitHub",
      href: "https://github.com/nexpid/website/tree/main/packages/reviews",
      end: true,
    },
  ].filter((x) => !!x) as { title: string; href: string; end?: boolean }[];

export default function Navbar({
  suspended: _suspended,
}: {
  suspended: boolean;
}) {
  const [suspended, setSuspended] = useState(_suspended);

  useEffect(() => {
    const cb = () => setSuspended(true);
    document.addEventListener("notification_suspended", cb);
    return () => document.removeEventListener("notification_suspended", cb);
  });

  const cont = content(suspended);
  return (
    <div className="fixed top-0 shadow-lg bg-zinc-300/50 dark:bg-zinc-800/50 backdrop-blur-lg w-full h-fit md:pl-20 md:pr-20 pt-3 pb-3 flex flex-row justify-center md:justify-start gap-10">
      {cont
        .filter((x) => !x.end)
        .map(({ title, href }, i) => (
          <Link href={href} className="hover:underline" key={i}>
            {title}
          </Link>
        ))}
      <div className="ml-auto">
        {cont
          .filter((x) => x.end)
          .map(({ title, href }, i) => (
            <Link href={href} className="hover:underline" key={i}>
              {title}
            </Link>
          ))}
      </div>
    </div>
  );
}
