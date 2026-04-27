import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const siteDisabled = process.env.SITE_DISABLED === "true";
  const { pathname } = req.nextUrl;

  // If site is disabled, redirect everything except the suspended page and static assets
  if (siteDisabled && pathname !== "/suspended") {
    const url = req.nextUrl.clone();
    url.pathname = "/suspended";
    return NextResponse.redirect(url);
  }

  // Admin auth guard
  if (pathname.startsWith("/admin/leads")) {
    const token = req.cookies.get("earls_admin")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
