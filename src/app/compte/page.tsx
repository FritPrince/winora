import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../(auth)/actions";

export default async function ComptePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-full flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">
          Mon compte
        </p>
        <h1 className="mt-3 font-serif text-2xl text-foreground">
          {user.email}
        </h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Aucune commande pour l&apos;instant — le catalogue arrive bientôt.
        </p>
        <form action={signOut} className="mt-8">
          <Button type="submit" variant="outline">
            Se déconnecter
          </Button>
        </form>
      </div>
    </main>
  );
}
