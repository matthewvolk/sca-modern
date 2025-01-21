import { and, eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import * as z from "zod";

import { TOKEN_COOKIE_KEY } from "@/lib/constants";
import { env } from "@/lib/env.mjs";
import { db } from "@/server/db";
import { storeUsers } from "@/server/db/schema";

const ClientTokenSchema = z.object({
  userId: z.number(),
  storeId: z.number(),
});

export const authorize = async () => {
  const cookieJar = await cookies();
  const jwt = cookieJar.get(TOKEN_COOKIE_KEY)?.value;

  if (!jwt) {
    notFound();
  }

  const secret = new TextEncoder().encode(env.JWT_SECRET);

  const verifiedJwt = await jwtVerify(jwt, secret);

  const parsedJwt = ClientTokenSchema.parse(verifiedJwt.payload);

  const storeUser = await db.query.storeUsers.findFirst({
    where: and(
      eq(storeUsers.userId, parsedJwt.userId),
      eq(storeUsers.storeId, parsedJwt.storeId),
    ),
    with: { store: true, user: true },
  });

  if (!storeUser) {
    notFound();
  }

  return storeUser;
};
