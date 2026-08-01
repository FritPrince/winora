import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// Handles the redirect back from a magic link or OAuth sign-in: exchanges
// the one-time code for a real session, stored in cookies.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/compte";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("La connexion a échoué, réessaie.")}`,
  );
}
