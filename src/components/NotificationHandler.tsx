/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { APINotification } from "@/lib/types";
import { useEffect, useRef } from "react";
import { useToast } from "./shadcn/ui/use-toast";

export default function NotificationHandler({ isAuth }: { isAuth: boolean }) {
  const notifs = useRef<APINotification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const run = async () => {
      if (!isAuth) return;

      const snotifs = (await (
        await fetch("/api/notifications", {
          cache: "no-store",
        })
      ).json()) as APINotification[];
      if ("error" in snotifs)
        return console.warn("Failed to fetch notifications", snotifs);

      const newNotifs = snotifs.filter(
        (x) =>
          !notifs.current.find((y) => x.sent === y.sent && x.type === y.type)
      );
      notifs.current = snotifs;

      newNotifs.forEach((x) =>
        document.dispatchEvent(new Event(`notification_${x.type}`))
      );

      for (const n of newNotifs)
        n.type === "suspended"
          ? toast({
              title: "Account Suspended",
              description:
                "Your account has been suspended. You may no longer post reviews",
              variant: "destructive",
            })
          : n.type === "pending-post"
          ? toast({
              title: "Pending Review Posted",
              description: "Your pending review has been posted!",
            })
          : n.type === "pending-deny"
          ? toast({
              title: "Pending Review Denied",
              description: "Your pending review has been denied!",
            })
          : null;
    };

    const int = setInterval(run, 10_000);
    run();

    return () => clearInterval(int);
  }, []);

  return null;
}
