import {
  Badge,
  EmptyState,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/shared/ui";
import { formatDate, formatMoney } from "@/shared/lib/format";
import { PAYMENT_TONE } from "@/shared/lib/status";
import type { Payment } from "@/shared/types";

const REFERENCE_CHARS = 14;

export function PaymentTable({
  payments,
  propertyTitle,
}: {
  payments: Payment[];
  /** Used when the rows are already scoped to one property and omit it. */
  propertyTitle?: string;
}) {
  if (payments.length === 0) {
    return (
      <EmptyState
        title="No payments yet"
        description="Settled and pending charges appear here once a tenancy is approved and paid."
      />
    );
  }

  return (
    <Table caption="Payment history">
      <THead>
        <TH className="w-10">No.</TH>
        <TH>Reference</TH>
        <TH>Property</TH>
        <TH numeric>Amount</TH>
        <TH>Provider</TH>
        <TH>Paid on</TH>
        <TH>Status</TH>
      </THead>
      <TBody>
        {payments.map((payment, index) => {
          const reference = payment.transactionId ?? null;
          const title =
            payment.rentalRequest?.property?.title ?? propertyTitle ?? "—";

          return (
            <TR key={payment.id}>
              <TD className="font-mono text-micro tabular-nums text-ink-faint">
                {String(index + 1).padStart(2, "0")}
              </TD>

              <TD
                title={reference ?? undefined}
                className="font-mono text-meta text-ink-muted"
              >
                {reference ? truncate(reference) : "—"}
              </TD>

              <TD className="max-w-[16rem] truncate">{title}</TD>

              <TD numeric className="font-mono text-meta">
                {formatMoney(payment.amount, payment.currency)}
              </TD>

              <TD className="text-micro uppercase tracking-label text-ink-muted">
                {payment.provider}
              </TD>

              <TD className="whitespace-nowrap text-meta text-ink-muted">
                {formatDate(payment.paidAt)}
              </TD>

              <TD>
                <Badge tone={PAYMENT_TONE[payment.status]}>
                  {payment.status}
                </Badge>
              </TD>
            </TR>
          );
        })}
      </TBody>
    </Table>
  );
}

function truncate(reference: string): string {
  return reference.length > REFERENCE_CHARS
    ? `${reference.slice(0, REFERENCE_CHARS)}…`
    : reference;
}
