import crypto from "node:crypto";

import { createServiceRoleClient } from "@/lib/supabase/service-role";

const MONEROO_API_BASE = "https://api.moneroo.io/v1";

async function getSettings() {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("moneroo_settings")
    .select("mode, sandbox_secret_key, live_secret_key, webhook_secret")
    .single();
  return data;
}

async function getActiveSecretKey() {
  const settings = await getSettings();
  if (!settings) {
    throw new Error("Moneroo n'est pas configuré.");
  }
  const key =
    settings.mode === "live"
      ? settings.live_secret_key
      : settings.sandbox_secret_key;
  if (!key) {
    throw new Error(
      `Aucune clé Moneroo enregistrée pour le mode ${settings.mode}. Configure-la dans l'admin (Réglages).`,
    );
  }
  return key;
}

export async function getWebhookSecret() {
  const settings = await getSettings();
  return settings?.webhook_secret ?? null;
}

interface InitializePaymentParams {
  amount: number;
  currency: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  returnUrl: string;
  metadata?: Record<string, string>;
}

interface MonerooInitializeData {
  id: string;
  checkout_url: string;
}

export async function initializeMonerooPayment(
  params: InitializePaymentParams,
): Promise<MonerooInitializeData> {
  const secretKey = await getActiveSecretKey();

  const response = await fetch(`${MONEROO_API_BASE}/payments/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      description: "Commande Winora",
      customer: {
        email: params.customerEmail,
        first_name: params.customerFirstName,
        last_name: params.customerLastName,
      },
      return_url: params.returnUrl,
      metadata: params.metadata,
    }),
  });

  const payload = await response.json();

  if (!response.ok || !payload?.data?.checkout_url) {
    throw new Error(
      payload?.message ?? "Échec de l'initialisation du paiement Moneroo.",
    );
  }

  return payload.data as MonerooInitializeData;
}

export async function verifyMonerooPayment(paymentId: string) {
  const secretKey = await getActiveSecretKey();

  const response = await fetch(
    `${MONEROO_API_BASE}/payments/${paymentId}/verify`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: "application/json",
      },
    },
  );

  const payload = await response.json();
  if (!response.ok) return null;
  return payload?.data as { id: string; status: string } | undefined;
}

export function verifyMonerooWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}
