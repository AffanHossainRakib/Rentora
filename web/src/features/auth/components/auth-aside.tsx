import { ROLE_LABEL, SITE } from "@/shared/config/navigation";
import type { Role } from "@/shared/types";

const STATEMENT: Record<
  "login" | "register",
  { eyebrow: string; headline: string; lede: string }
> = {
  login: {
    eyebrow: "Access",
    headline: "One ledger for the whole tenancy.",
    lede: "Listings, requests, approvals and rent live in the same record, so nobody has to reconstruct a deal from a message thread.",
  },
  register: {
    eyebrow: "Enrolment",
    headline: "Pick the side of the tenancy you are on.",
    lede: "Your role decides what the app puts in front of you. It is set once, at registration, and it cannot be changed from the interface.",
  },
};

/** Each line is a capability the API actually exposes for that role. */
const ROLES: Array<{ role: Role; line: string }> = [
  {
    role: "TENANT",
    line: "Search listings by area, price and category, request dates on one, pay the approved rent by card, and review the stay once it is completed.",
  },
  {
    role: "LANDLORD",
    line: "Publish properties with price, location, category and amenities, then approve or reject every request they attract.",
  },
  {
    role: "ADMIN",
    line: "Reads every account, property and request platform-wide, deactivates an account, and closes out an active tenancy. Issued by Rentora — never self-registered.",
  },
];

export function AuthAside({
  variant = "login",
}: {
  variant?: "login" | "register";
}) {
  const copy = STATEMENT[variant];

  return (
    <aside className="relative hidden overflow-hidden bg-ink text-paper lg:flex lg:flex-col lg:justify-between">

      <div className="relative px-10 pt-14 xl:px-14">
        <p className="font-mono text-micro uppercase tracking-label text-paper/70">
          {copy.eyebrow}
        </p>
        <p className="mt-8 text-balance text-h2 tracking-tight-lg text-paper xl:text-h1">
          {copy.headline}
        </p>
        <p className="mt-5 max-w-prose-tight text-body text-paper/75">
          {copy.lede}
        </p>
      </div>

      <div className="relative px-10 pb-14 pt-12 xl:px-14">
        <p className="border-b border-paper/25 pb-3 font-mono text-micro uppercase tracking-label text-paper/70">
          Three roles
        </p>
        <ol>
          {ROLES.map(({ role, line }, index) => (
            <li
              key={role}
              className="flex gap-5 border-b border-paper/25 py-5 last:border-b-0 last:pb-0"
            >
              <span className="w-6 shrink-0 font-mono text-micro tabular-nums text-paper/70">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className="text-micro font-medium uppercase tracking-label text-paper">
                  {ROLE_LABEL[role]}
                </p>
                <p className="mt-2 text-meta text-paper/75">{line}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10 font-mono text-micro uppercase tracking-label text-paper/70">
          {SITE.tagline}
        </p>
      </div>
    </aside>
  );
}
