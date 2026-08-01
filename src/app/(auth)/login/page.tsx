import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  signInWithGoogle,
  signInWithMagicLink,
  signInWithPassword,
} from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; "check-email"?: string }>;
}) {
  const { error, "check-email": checkEmail } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-serif text-2xl text-foreground">Se connecter</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Accède à ton compte Winora.
        </p>
      </div>

      {checkEmail && (
        <p className="rounded-lg border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm text-foreground">
          Vérifie ta boîte mail : on t&apos;a envoyé un lien de connexion.
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-foreground">
          {error}
        </p>
      )}

      <form action={signInWithPassword} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoFocus />
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
          Se connecter
        </Button>
        <Button type="submit" formAction={signInWithMagicLink} variant="outline">
          Recevoir un lien magique
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
        Pas encore de compte ?{" "}
        <Link href="/signup" className="text-gold-strong hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
