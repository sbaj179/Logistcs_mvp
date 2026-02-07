import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        response.cookies.set({ name, value: "", ...options });
      }
    }
  });

  const { data } = await supabase.auth.getSession();
  const session = data.session;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!session.user?.email_confirmed_at) {
    return NextResponse.redirect(new URL("/verify-email", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/shipments/:path*",
    "/cases/:path*",
    "/documents/:path*",
    "/idle/:path*",
    "/analytics/:path*",
    "/ingestion/:path*",
    "/handover/:path*",
    "/settings/:path*"
  ]
};
