import {
  RESTGetAPICurrentUserResult,
  RESTPostOAuth2AccessTokenResult,
  RouteBases,
  Routes,
} from "discord-api-types/v10";
import { unhash } from "../cookies";
import { root } from "../base";
import { isAdmin } from "../waitlist";
import { UserState, getUserState } from "../data/users";

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string | null;
  display: string | null;
  avatar: string | null;
}

interface Tokens {
  access: string;
  refresh: string;
  expiresAt: number;
}

export interface Authorization {
  user: DiscordUser;
  admin: boolean;
  state: UserState;
  tokens: Tokens;
}

export interface RawAuthorization {
  tokens: Tokens;
}

const makeUser = async (tokens: Tokens): Promise<DiscordUser | undefined> => {
  const res: RESTGetAPICurrentUserResult = await (
    await fetch(`${RouteBases.api}${Routes.user("@me")}`, {
      next: {
        revalidate: 5 * 60,
      },
      headers: {
        Authorization: `Bearer ${tokens.access}`,
      },
    })
  ).json();

  return res.id
    ? {
        id: res.id,
        username: res.username,
        discriminator: res.discriminator !== "0" ? res.discriminator : null,
        display: res.global_name,
        avatar: res.avatar,
      }
    : undefined;
};

export async function makeAuthorization(
  code: string
): Promise<Authorization | undefined> {
  const body = new URLSearchParams();
  body.append("client_id", process.env.discord_client_id!);
  body.append("client_secret", process.env.discord_client_secret!);
  body.append("grant_type", "authorization_code");
  body.append("code", code);
  body.append("redirect_uri", `${root()}oauth2/grant`);

  const res: RESTPostOAuth2AccessTokenResult = await (
    await fetch(`${RouteBases.api}${Routes.oauth2TokenExchange()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    })
  ).json();
  if (!res.access_token || !res.refresh_token) return;

  const tokens: Tokens = {
    access: res.access_token,
    refresh: res.refresh_token,
    expiresAt: Date.now() + res.expires_in,
  };

  const user = await makeUser(tokens);
  if (!user) return;

  return {
    user,
    admin: isAdmin(user.id),
    state: await getUserState(user.id),
    tokens,
  };
}

export async function getAuthorization(
  cookie?: string
): Promise<Authorization | undefined> {
  const raw = cookie && (await unhash(cookie));
  if (!raw) return;

  const data: RawAuthorization = JSON.parse(raw);

  if (Date.now() >= data.tokens.expiresAt) {
    const body = new URLSearchParams();
    body.append("client_id", process.env.discord_client_id!);
    body.append("client_secret", process.env.discord_client_secret!);
    body.append("grant_type", "refresh_token");
    body.append("refresh_token", data.tokens.refresh);

    const res: RESTPostOAuth2AccessTokenResult = await (
      await fetch(`${RouteBases.api}${Routes.oauth2TokenExchange()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      })
    ).json();

    if (res.access_token && res.refresh_token) {
      data.tokens.access = res.access_token;
      data.tokens.refresh = res.refresh_token;
      data.tokens.expiresAt = Date.now() + res.expires_in;
    } else return;
  }

  const user = await makeUser(data.tokens);
  if (!user) return;

  return {
    user,
    admin: isAdmin(user.id),
    state: await getUserState(user.id),
    tokens: data.tokens,
  };
}
