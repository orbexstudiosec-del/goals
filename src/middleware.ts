import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Propaga la ruta actual como header para que el RootLayout sepa si es /admin. */
export function middleware(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
