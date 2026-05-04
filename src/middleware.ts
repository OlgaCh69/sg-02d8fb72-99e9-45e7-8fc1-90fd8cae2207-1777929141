import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // RBAC logic can be implemented here using Supabase Server Client if needed
  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};