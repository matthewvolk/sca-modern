import bigrequest from "bigrequest";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

import { env } from "@/lib/env.mjs";
import { db } from "@/server/db";
import { stores } from "@/server/db/schema";

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

  await db.delete(stores).where(eq(stores.storeHash, storeHash));

  return new NextResponse(null, { status: 200 });
};
