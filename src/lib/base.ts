import { headers } from "next/headers";
import { NextRequest } from "next/server";

export function root(req?: NextRequest) {
  const host = req?.headers.get("Host") ?? headers().get("Host")!;

  return `http${!host.match(/^[0-9]{1,3}/) ? "s" : ""}://${host}${
    !host.endsWith("/") ? "/" : ""
  }`;
}
export function api(req?: NextRequest) {
  return `${root(req)}api/`;
}
