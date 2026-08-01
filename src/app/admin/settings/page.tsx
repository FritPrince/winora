import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { saveMonerooSettings } from "./actions";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("moneroo_settings")
    .select("mode, sandbox_secret_key, live_secret_key, webhook_secret")
    .single();

  // Derive booleans immediately — the raw secret values are never used
  // anywhere else in this component.
  const hasSandboxKey = Boolean(settings?.sandbox_secret_key);
  const hasLiveKey = Boolean(settings?.live_secret_key);
  const hasWebhookSecret = Boolean(settings?.webhook_secret);
  const mode = settings?.mode ?? "sandbox";

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Paiement — Moneroo</h1>
      <p className="mt-2 text-sm text-foreground-muted">
        Les clés sont stockées côté serveur et ne sont jamais renvoyées au
        navigateur. Laisse un champ vide pour garder la valeur déjà
        enregistrée.
      </p>

      {saved && (
        <p className="mt-4 rounded-lg border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm text-foreground">
          Réglages enregistrés.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-foreground">
          {error}
        </p>
      )}

      <form action={saveMonerooSettings} className="mt-8 flex flex-col gap-6">
        <div>
          <Label>Mode actif</Label>
          <div className="mt-2 flex gap-6 text-sm text-foreground">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="sandbox"
                defaultChecked={mode !== "live"}
              />
              Sandbox (test)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="live"
                defaultChecked={mode === "live"}
              />
              Live (production)
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="sandbox_secret_key">
            Clé secrète sandbox
            {hasSandboxKey && (
              <span className="ml-2 text-emerald">configurée</span>
            )}
          </Label>
          <Input
            id="sandbox_secret_key"
            name="sandbox_secret_key"
            type="password"
            placeholder={hasSandboxKey ? "•••••••• (laisser vide pour garder)" : "pvk_sandbox_..."}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="live_secret_key">
            Clé secrète live
            {hasLiveKey && <span className="ml-2 text-emerald">configurée</span>}
          </Label>
          <Input
            id="live_secret_key"
            name="live_secret_key"
            type="password"
            placeholder={hasLiveKey ? "•••••••• (laisser vide pour garder)" : "pvk_live_..."}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="webhook_secret">
            Secret webhook
            {hasWebhookSecret && (
              <span className="ml-2 text-emerald">configuré</span>
            )}
          </Label>
          <Input
            id="webhook_secret"
            name="webhook_secret"
            type="password"
            placeholder={
              hasWebhookSecret ? "•••••••• (laisser vide pour garder)" : ""
            }
          />
          <p className="text-xs text-foreground-muted">
            Depuis le dashboard Moneroo : Developers → Webhooks → Add
            webhook, avec l&apos;URL{" "}
            <code>/api/webhooks/moneroo</code> de ce site.
          </p>
        </div>

        <Button type="submit">Enregistrer</Button>
      </form>
    </div>
  );
}
