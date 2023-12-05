import bigrequest from "bigrequest";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

import { TOKEN_COOKIE_KEY } from "@/lib/constants";
import { env } from "@/lib/env.mjs";
import { db } from "@/server/db";
import { storeUsers, stores, users } from "@/server/db/schema";

const QueryParamSchema = z.object({
  signed_payload_jwt: z.string(),
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

  const verifiedJwt = await bc.verify(
    parsedQueryParams.data.signed_payload_jwt,
  );

  const storeHash = verifiedJwt.sub.split("/")[1];

  const store = await db.query.stores.findFirst({
    where: eq(stores.storeHash, storeHash),
  });

  if (!store) {
    return new NextResponse("Store not found", { status: 404 });
  }

  const user = await db
    .insert(users)
    .values({
      email: verifiedJwt.user.email,
      userId: verifiedJwt.user.id,
    })
    .onConflictDoUpdate({
      target: users.userId,
      set: {
        email: verifiedJwt.user.email,
      },
    })
    .returning();

  const storeUser = await db
    .insert(storeUsers)
    .values({
      storeId: store.id,
      userId: user[0].id,
      isAdmin: verifiedJwt.owner.id === verifiedJwt.user.id,
    })
    .onConflictDoUpdate({
      target: [storeUsers.storeId, storeUsers.userId],
      set: {
        isAdmin: verifiedJwt.owner.id === verifiedJwt.user.id,
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

  return NextResponse.redirect(
    verifiedJwt.url ? `${env.APP_ORIGIN}${verifiedJwt.url}` : env.APP_ORIGIN,
    {
      status: 302,
      statusText: "Found",
      headers: {
        "set-cookie": `${TOKEN_COOKIE_KEY}=${clientToken}; SameSite=None; Secure; Path=/; Partitioned; HttpOnly; Max-Age=3600;`,
      },
    },
  );
};
