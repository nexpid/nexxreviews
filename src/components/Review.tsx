"use client";

import moment from "moment";
import { ReviewData } from "@/lib/types";
import { Skeleton } from "./shadcn/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "./shadcn/ui/avatar";
import { makeAvatar } from "@/lib/discord/util";
import { avatarFallback } from "@/lib/util";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./shadcn/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "./shadcn/ui/context-menu";
import { Authorization } from "@/lib/discord/authorization";
import { useToast } from "./shadcn/ui/use-toast";
import { api } from "@/lib/base";
import { useState } from "react";

export default function Review({
  data,
  authorization,
}: {
  data?: ReviewData;
  authorization?: Authorization;
}) {
  const { toast } = useToast();
  const isAuthor = authorization?.user.id === data?.author.id;
  const isAdmin = authorization?.admin;

  const [deleted, setDeleted] = useState(false);
  if (deleted) return null;

  const copy = (field: string, content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      description: `Copied ${field}!`,
    });
  };

  return data ? (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="w-full h-fit p-8 rounded-sm flex flex-col bg-zinc-200 dark:bg-zinc-900 gap-4">
          <div className="flex flex-row items-center gap-3">
            <Avatar className="w-10 h-10 shadow-xl">
              <AvatarImage
                src={makeAvatar(
                  data.author.id,
                  data.author.discriminator,
                  data.author.avatar
                )}
              />
              <AvatarFallback>
                {avatarFallback(data.author.display ?? data.author.username)}
              </AvatarFallback>
            </Avatar>
            <p className="text-xl font-semibold">
              {data.author.display ?? data.author.username}
              {data.author.discriminator && !data.author.display
                ? `#${data.author.discriminator}`
                : ""}
            </p>
          </div>
          <p className="text-xl h-12">{data.message}</p>
          <div className="flex flex-row justify-end items-center gap-3 opacity-50">
            {data.updatedAt && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <p className="text-md font-light">
                        Updated {moment(data.updatedAt).fromNow()}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {moment(data.updatedAt).format(
                          "MMMM Do YYYY, h:mm:ss a"
                        )}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="w-1 h-1 bg-zinc-800 dark:bg-zinc-200 rounded-full" />
              </>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <p className="text-md font-light">
                    Posted {moment(data.createdAt).fromNow()}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {moment(data.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem inset onClick={() => copy("message", data.message)}>
          Copy Message
        </ContextMenuItem>
        <ContextMenuItem
          inset
          onClick={() => copy("author ID", data.author.id)}
        >
          Copy Author
        </ContextMenuItem>
        {isAuthor && (
          <>
            <ContextMenuSeparator />
            {/* <ContextMenuItem inset>Edit Review</ContextMenuItem> */}
            <ContextMenuItem
              inset
              onClick={async () => {
                toast({
                  description: "Deleting review...",
                });
                const res = await (
                  await fetch("/api/reviews", {
                    method: "DELETE",
                  })
                ).json();

                if (res.error) {
                  toast({
                    description: `Failed to delete review! (error: ${res.error})`,
                    variant: "destructive",
                  });
                } else {
                  toast({
                    description: "Deleted review!",
                  });
                  setDeleted(true);
                }
              }}
            >
              <p className="text-red-500">Delete Review</p>
            </ContextMenuItem>
          </>
        )}
        {isAdmin && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem inset>
              <p className="text-red-500">Suspend Author</p>
            </ContextMenuItem>
            {!isAuthor && (
              <ContextMenuItem
                inset
                onClick={async () => {
                  toast({
                    description: "Deleting review...",
                  });
                  const res = await (
                    await fetch(`/api/reviews/admin/post/${data.author.id}`, {
                      method: "DELETE",
                    })
                  ).json();

                  if (res.error) {
                    toast({
                      description: `Failed to delete review! (error: ${res.error})`,
                      variant: "destructive",
                    });
                  } else {
                    toast({
                      description: "Deleted review!",
                    });
                    setDeleted(true);
                  }
                }}
              >
                <p className="text-red-500">Delete Review</p>
              </ContextMenuItem>
            )}
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  ) : (
    <Skeleton className="w-full h-fit p-8 rounded-sm flex flex-col gap-4 bg-zinc-200 dark:bg-zinc-900">
      <div className="flex flex-row items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full shadow-xl bg-zinc-300 dark:bg-zinc-800" />
        <Skeleton className="h-4 w-[150px] shadow-xl bg-zinc-300 dark:bg-zinc-800" />
      </div>
      <Skeleton className="h-4 w-full shadow-xl bg-zinc-300 dark:bg-zinc-800" />
      <Skeleton className="h-4 w-3/4 shadow-xl bg-zinc-300 dark:bg-zinc-800" />
      <div className="flex flex-row justify-end items-center gap-3">
        <Skeleton className="h-4 w-[180px] shadow-xl bg-zinc-300 dark:bg-zinc-800" />
        <Skeleton className="h-2 w-2 rounded-full shadow-xl bg-zinc-300 dark:bg-zinc-800" />
        <Skeleton className="h-4 w-[180px] shadow-xl bg-zinc-300 dark:bg-zinc-800" />
      </div>
    </Skeleton>
  );
}
