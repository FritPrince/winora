import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithGoogle, signUpWithPassword } from "../actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; "check-email"?: string }>;
}) {
  const { error, "check-email": checkEmail } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-serif text-2xl text-foreground">Créer un compte</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Rejoins Winora en quelques secondes.
        </p>
      </div>

      {checkEmail && (
        <p className="rounded-lg border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm text-foreground">
          Vérifie ta boîte mail pour confirmer ton compte.
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-foreground">
          {error}
        </p>
      )}

      <form action={signUpWithPassword} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="full_name">Nom complet</Label>
          <Input id="full_name" name="full_name" type="text" required autoFocus />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
          />
        </div>
        <Button type="submit" className="mt-2">
          Créer mon compte
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-foreground-muted">
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={signInWithGoogle}>
        <Button type="submit" variant="outline" className="w-full">
          Continuer avec Google
        </Button>
      </form>

      <p className="text-center text-sm text-foreground-muted">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-gold-strong hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
