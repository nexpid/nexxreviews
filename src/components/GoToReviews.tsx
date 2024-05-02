"use client";

import styles from "./GoToReviews.module.css";
import { ArrowDownIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function GoToReviews() {
  const [shallAppear, setShallAppear] = useState(true);

  useEffect(() => {
    const runCheck = () => {
      const scroll = window.scrollY;
      const target =
        document.querySelector("#reviews")?.getBoundingClientRect().y ?? 0;

      setShallAppear(scroll < target);
    };

    runCheck();
    window.addEventListener("scroll", runCheck);
    return () => window.removeEventListener("scroll", runCheck);
  });

  return (
    <a
      className={`fixed bottom-5 right-5 py-3 px-5 text-lg font-medium backdrop-blur-lg bg-zinc-300/50 dark:bg-zinc-800/50 hover:bg-zinc-200/50 hover:dark:bg-zinc-700/50 border-zinc-400/80 dark:border-zinc-500/80 border-[1px] rounded-full flex flex-row gap-2 items-center select-none cursor-pointer transition-colors ${
        shallAppear ? styles.appear : styles.disappear
      }`}
      href="#reviews"
    >
      <ArrowDownIcon />
      Go to Reviews
    </a>
  );
}
