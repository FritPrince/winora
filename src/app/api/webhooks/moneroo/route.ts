import { NextResponse } from "next/server";

import { getWebhookSecret, verifyMonerooWebhookSignature } from "@/lib/moneroo";
import { markOrderPaid } from "@/lib/orders";

// Moneroo retries up to 3 times (10 min apart) on anything but a 200, so
// every branch below must return promptly rather than throwing.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-moneroo-signature");

  const webhookSecret = await getWebhookSecret();
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  if (!verifyMonerooWebhookSignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { event?: string; data?: { id?: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (payload.event === "payment.success" && payload.data?.id) {
    await markOrderPaid(payload.data.id);
  }

  return NextResponse.json({ received: true });
}
