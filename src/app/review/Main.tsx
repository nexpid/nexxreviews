/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { Label } from "@/components/shadcn/ui/label";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useEffect, useReducer, useRef, useState } from "react";
import Fallback from "./Fallback";

export default function Main({
  val: _val,
  pending: _pending,
  admin,
}: {
  val?: string;
  pending?: string;
  admin: boolean;
}) {
  const { toast } = useToast();
  const messageRef = useRef<HTMLTextAreaElement>();
  const [posted, setPosted] = useState(false);
  const [suspended, suspend] = useReducer((_) => true, false);

  const [val, setVal] = useState(_val);
  const [pending, setPending] = useState(_pending);

  useEffect(() => {
    const vl = pending ?? val;
    if (messageRef.current && vl) messageRef.current.value = vl;
  }, []);

  useEffect(() => {
    const listen = (event: string, callback: () => void) => {
      document.addEventListener(event, callback);
      return () => document.removeEventListener(event, callback);
    };

    const remove = [
      listen("notification_pending-post", () => {
        if (pending) setVal(pending);
        setPending(undefined);
        window.location.hash = "reviews";
        window.location.pathname = "/";
      }),
      listen("notification_pending-deny", () => {
        setPending(undefined);
        if (messageRef.current) messageRef.current.value = "";
      }),
      listen("notification_suspended", () => suspend()),
    ];

    return () => remove.forEach((x) => x());
  });

  return suspended ? (
    <Fallback />
  ) : (
    <Card className="w-[30rem] max-w-full">
      <CardHeader>
        <CardTitle>
          {pending ? "Pending Review" : `${val ? "Edit" : "Write"} Review`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder={pending ?? val}
                ref={(x: any) => (messageRef.current = x)}
                disabled={posted ? !admin : !!pending}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter
        className={`flex ${val && admin ? "justify-between" : "justify-end"}`}
      >
        {pending ? (
          <Button
            disabled={posted}
            variant="destructive"
            onClick={async () => {
              if (posted) return;

              setPosted(true);
              toast({
                description: "Cancelling pending review...",
              });

              const res = await (
                await fetch("/api/reviews?prefer_pending", {
                  method: "DELETE",
                })
              ).json();

              setPosted(false);
              if (res.error) {
                toast({
                  description: `Failed to cancel pending review! (error: ${res.error})`,
                  variant: "destructive",
                });
              } else {
                toast({
                  description: `Cancelled your pending review!`,
                });
                setPending(undefined);
              }
            }}
          >
            Cancel
          </Button>
        ) : (
          <>
            {val && (
              <Button
                disabled={posted}
                variant="destructive"
                onClick={async () => {
                  if (posted) return;

                  setPosted(true);
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
                    setPosted(false);
                  } else {
                    toast({
                      description: "Deleted your review!",
                    });
                    setVal(undefined);
                    setPosted(false);
                    if (messageRef.current) messageRef.current.value = "";
                  }
                }}
              >
                Delete
              </Button>
            )}
            {(!val || admin) && (
              <Button
                disabled={posted}
                onClick={async () => {
                  if (posted) return;
                  const message = messageRef.current?.value;
                  if (!message) return;

                  const title = val ? "Review Edit Status" : "Review Status";

                  setPosted(true);
                  toast({
                    title,
                    description: val ? "Editing..." : "Posting...",
                  });

                  const res = await (
                    await fetch("/api/reviews", {
                      method: val ? "PATCH" : "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        message,
                      }),
                    })
                  ).json();

                  if (res.error) {
                    toast({
                      title,
                      description: `Failed to ${
                        val ? "edit" : "post"
                      }! (error: ${res.error})`,
                      variant: "destructive",
                    });
                    setPosted(false);
                  } else {
                    if (res.pending) {
                      toast({
                        title,
                        description: "Requested review!",
                      });
                      setPosted(false);
                      setPending(res.message);
                    } else {
                      toast({
                        title,
                        description: `${
                          val ? "Edited" : "Posted"
                        } your review!`,
                      });
                      window.location.hash = "reviews";
                      window.location.pathname = "/";
                    }
                  }
                }}
              >
                {val ? "Edit" : "Post"}
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
