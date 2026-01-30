import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_PREFIX = "next-auth";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith(COOKIE_PREFIX)) {
      response.cookies.set(cookie.name, "", {
        path: "/",
        maxAge: 0,
      });
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
