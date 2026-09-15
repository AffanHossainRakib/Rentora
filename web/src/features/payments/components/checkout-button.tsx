"use client";

import { useState, useTransition } from "react";
import { startCheckoutAction } from "../model/actions";
import { Button } from "@/shared/ui";

export function CheckoutButton({
  rentalRequestId,
  label = "Pay now",
}: {
  rentalRequestId: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function checkout() {
    setError(null);
    startTransition(async () => {
      // Resolves only on failure — success redirects to Stripe.
      const result = await startCheckoutAction(rentalRequestId);
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm" onClick={checkout} disabled={pending}>
        {pending ? "Opening checkout…" : label}
      </Button>
      <p role="alert" className="text-micro text-critical">
        {error}
      </p>
    </div>
  );
}
