import { jwtVerify } from "jose";
import { z } from "zod";

import { StoreUser } from "@/lib/authorize";
import { env } from "@/lib/env.mjs";

export async function oauth(code: string, context: string, scope: string) {
  const authResponse = await fetch(
    `https://login.bigcommerce.com/oauth2/token`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        client_id: env.CLIENT_ID,
        client_secret: env.CLIENT_SECRET,
        code,
        context,
        scope,
        grant_type: "authorization_code",
        redirect_uri: `${env.APP_ORIGIN}/auth/install`,
      }),
    },
  );

  const payload = await authResponse.json();

  return z
    .object({
      access_token: z.string(),
      scope: z.string(),
      user: z.object({
        id: z.number(),
        username: z.string(),
        email: z.string(),
      }),
      context: z.string(),
      account_uuid: z.string(),
    })
    .parse(payload);
}

export async function verifyJwt(jwt: string) {
  const { payload } = await jwtVerify(
    jwt,
    new TextEncoder().encode(env.CLIENT_SECRET),
  );

  return z
    .object({
      aud: z.string(),
      iss: z.string(),
      iat: z.number(),
      nbf: z.number(),
      exp: z.number(),
      jti: z.string(),
      sub: z.string(),
      user: z.object({
        id: z.number(),
        email: z.string().email(),
        locale: z.string(),
      }),
      owner: z.object({
        id: z.number(),
        email: z.string().email(),
      }),
      url: z.string(),
      channel_id: z.number().nullable(),
    })
    .parse(payload);
}

export async function getStoreInformation(storeUser: StoreUser) {
  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeUser.store.storeHash}/v2/store`,
    {
      headers: {
        "X-Auth-Token": storeUser.store.accessToken,
        Accept: "application/json",
      },
    },
  );

  return response.json();
}

export const bc = {
  oauth,
  verifyJwt,
  getStoreInformation,
};
