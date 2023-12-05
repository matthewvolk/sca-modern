import bigrequest from "bigrequest";
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

import { TOKEN_COOKIE_KEY } from "@/lib/constants";
import { env } from "@/lib/env.mjs";
import { db } from "@/server/db";
import { storeUsers, stores, users } from "@/server/db/schema";

const QueryParamSchema = z.object({
  code: z.string(),
  scope: z.string(),
  context: z.string(),
});

export const runtime = "nodejs";

export const GET = async (request: NextRequest) => {
  const queryParams = Object.fromEntries(request.nextUrl.searchParams);

  const parsedQueryParams = QueryParamSchema.safeParse(queryParams);

  if (!parsedQueryParams.success) {
    return new NextResponse("Invalid query parameters", { status: 400 });
  }

  const bc = bigrequest.oauth({
    authCallback: `${env.APP_ORIGIN}/auth/install`,
    clientId: env.CLIENT_ID,
    clientSecret: env.CLIENT_SECRET,
  });

  const authResponse = await bc.authorize(parsedQueryParams.data);

  const storeHash = authResponse.context.split("/")[1];

  const store = await db
    .insert(stores)
    .values({
      storeHash,
      accessToken: authResponse.access_token,
      scope: authResponse.scope,
    })
    .onConflictDoUpdate({
      target: stores.storeHash,
      set: {
        accessToken: authResponse.access_token,
        scope: authResponse.scope,
      },
    })
    .returning();

  const user = await db
    .insert(users)
    .values({
      userId: authResponse.user.id,
      email: authResponse.user.email,
      username: authResponse.user.username,
    })
    .onConflictDoUpdate({
      target: users.userId,
      set: {
        email: authResponse.user.email,
        username: authResponse.user.username,
      },
    })
    .returning();

  const storeUser = await db
    .insert(storeUsers)
    .values({
      storeId: store[0].id,
      userId: user[0].id,
      isAdmin: true,
    })
    .onConflictDoUpdate({
      target: [storeUsers.userId, storeUsers.storeId],
      set: {
        isAdmin: true,
      },
    })
    .returning();

  const secret = new TextEncoder().encode(env.JWT_SECRET);

  const clientToken = await new SignJWT({
    storeId: storeUser[0].storeId,
    userId: storeUser[0].userId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);

  return NextResponse.redirect(env.APP_ORIGIN, {
    status: 302,
    statusText: "Found",
    headers: {
      "set-cookie": `${TOKEN_COOKIE_KEY}=${clientToken}; SameSite=None; Secure; Path=/; Partitioned; HttpOnly; Max-Age=3600;`,
    },
  });
};
