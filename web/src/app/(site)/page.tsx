import Link from "next/link";
import { ArrowRight, ArrowUpRight, CreditCard, MapPin, Star } from "lucide-react";
import { PropertyCard } from "@/features/properties";
import { listProperties } from "@/features/properties/server";
import { ButtonLink } from "@/shared/ui";
import { formatRent } from "@/shared/lib/format";
import { Reveal } from "@/shared/ui/reveal";
import { HeroIntro } from "./_hero-intro";
import type { Property } from "@/shared/types";

const STEPS = [
  {
    index: "01",
    title: "Search",
    body: "Filter live listings by area, category and monthly rent. No account needed to look.",
  },
  {
    index: "02",
    title: "Request",
    body: "Pick your dates and submit. The request opens as pending and appears in your dashboard straight away.",
  },
  {
    index: "03",
    title: "Approve, then pay",
    body: "The landlord decides. Once approved you settle the rent through Stripe and the tenancy goes active.",
  },
  {
    index: "04",
    title: "Review",
    body: "When the tenancy completes you leave one review — a rating and a note, tied to that stay.",
  },
];

interface Area {
  location: string;
  count: number;
  from: number;
  to: number;
  available: number;
}

/** Coverage is derived from the listings themselves, never a hardcoded list. */
function groupByLocation(properties: Property[]): Area[] {
  const byLocation = new Map<string, Property[]>();

  for (const property of properties) {
    const key = property.location.trim() || "Unspecified";
    byLocation.set(key, [...(byLocation.get(key) ?? []), property]);
  }

  return [...byLocation.entries()]
    .map(([location, group]) => ({
      location,
      count: group.length,
      from: Math.min(...group.map((p) => p.price)),
      to: Math.max(...group.map((p) => p.price)),
      available: group.filter((p) => p.isAvailable).length,
    }))
    .sort((a, b) => b.count - a.count || a.location.localeCompare(b.location));
}

export default async function LandingPage() {
  let catalogue: Property[] = [];
  let listingsUnavailable = false;

  try {
    // One fetch feeds both the featured strip and the coverage index.
    const { properties } = await listProperties({ limit: 100 });
    catalogue = properties;
  } catch {
    listingsUnavailable = true;
  }

  const areas = groupByLocation(catalogue);
  const featured = catalogue.filter((p) => p.isAvailable).slice(0, 6);

  const heroFacts = [
    { icon: MapPin, label: "Areas covered", value: String(areas.length) },
    { icon: Star, label: "Listings live", value: String(catalogue.length) },
    { icon: CreditCard, label: "Payments", value: "Stripe" },
  ];

  return (
    <>
      <Section first>
        <HeroIntro>
          <p
            data-hero="eyebrow"
            className="font-mono text-micro uppercase tracking-label text-ink-faint"
          >
            Rental marketplace — Bangladesh
          </p>

          <h1 className="mt-6 max-w-[14ch] text-h1 sm:text-display">
            <span className="block overflow-hidden pb-1">
              <span data-hero="line" className="block">
                Rental housing,
              </span>
            </span>
            <span className="block overflow-hidden pb-1">
              <span data-hero="line" className="block">
                listed plainly<span className="text-signal">.</span>
              </span>
            </span>
          </h1>

          <p
            data-hero="fade"
            className="mt-7 max-w-prose text-lead text-ink-muted"
          >
            No brokers, no bidding, no invented urgency. A rent figure, an
            address, a set of dates, and a landlord who either says yes or says
            no.
          </p>

          <div data-hero="fade" className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/properties" size="lg">
              Browse listings
              <ArrowRight aria-hidden focusable="false" size={16} strokeWidth={1.5} />
            </ButtonLink>
            <ButtonLink href="/register" size="lg" variant="outline">
              List a property
            </ButtonLink>
          </div>

          <dl
            data-hero="fade"
            className="mt-16 flex flex-wrap gap-x-14 gap-y-8 border-t border-rule pt-8"
          >
            {heroFacts.map((fact) => (
              <div key={fact.label}>
                <dt className="flex items-center gap-2 text-micro uppercase tracking-label text-ink-faint">
                  <fact.icon aria-hidden focusable="false" size={14} strokeWidth={1.75} />
                  {fact.label}
                </dt>
                <dd className="mt-2 text-h4 tabular-nums text-ink">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </HeroIntro>
      </Section>

      <Section id="how" index="01" title="How a tenancy happens">
        <Reveal>
          <p className="mt-4 max-w-prose text-body text-ink-muted">
            Four moves from listing to review. Each maps to a status the API
            records against your request, so what you read here is what the
            dashboard shows.
          </p>
        </Reveal>

        <Reveal
          stagger
          as="ol"
          className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map((step) => (
            <li key={step.index} className="border-t border-ink pt-5">
              <p className="font-mono text-micro tabular-nums text-ink-faint">
                {step.index}
              </p>
              <h3 className="mt-4 text-h4">{step.title}</h3>
              <p className="mt-3 text-meta text-ink-muted">{step.body}</p>
            </li>
          ))}
        </Reveal>
      </Section>

      <Section id="coverage" index="02" title="Where the listings are">
        <Reveal>
          <p className="mt-4 max-w-prose text-body text-ink-muted">
            Every area below is taken from the live catalogue, with the rent
            actually being asked there. Each one opens as a filter.
          </p>
        </Reveal>

        {areas.length === 0 ? (
          <p className="mt-12 border border-rule px-5 py-8 text-meta text-ink-muted">
            {listingsUnavailable
              ? "Coverage could not be loaded just now."
              : "No listings are published yet."}
          </p>
        ) : (
          <Reveal stagger as="ul" className="mt-12 border-t border-ink">
            {areas.map((area, i) => (
              <li key={area.location}>
                <Link
                  href={`/properties?location=${encodeURIComponent(area.location)}`}
                  className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 gap-y-1 border-b border-rule py-5 transition-colors duration-150 hover:border-ink sm:grid-cols-[3rem_1fr_8rem_10rem_1.5rem]"
                >
                  <span className="font-mono text-micro tabular-nums text-ink-faint transition-colors group-hover:text-signal">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="text-h4 text-ink sm:text-h3">
                    {area.location}
                  </span>

                  <span className="col-start-2 text-micro uppercase tracking-label text-ink-faint sm:col-start-3 sm:text-right">
                    {area.available} of {area.count} free
                  </span>

                  <span className="col-start-3 row-start-1 text-meta tabular-nums text-ink sm:col-start-4 sm:text-right">
                    {area.from === area.to
                      ? formatRent(area.from)
                      : `${formatRent(area.from)} – ${formatRent(area.to)}`}
                  </span>

                  <ArrowUpRight
                    aria-hidden
                    focusable="false"
                    size={16}
                    strokeWidth={1.5}
                    className="hidden text-ink-faint opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100 motion-reduce:transition-none sm:block"
                  />
                </Link>
              </li>
            ))}
          </Reveal>
        )}
      </Section>

      <Section index="03" title="Available now">
        <Reveal>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <p className="max-w-prose text-body text-ink-muted">
              A sample of listings currently taking requests.
            </p>
            <ButtonLink href="/properties" variant="outline" size="sm">
              All listings
            </ButtonLink>
          </div>
        </Reveal>

        {listingsUnavailable ? (
          <p className="mt-12 border border-rule px-5 py-8 text-meta text-ink-muted">
            Live listings could not be loaded just now.{" "}
            <Link
              href="/properties"
              className="text-ink underline decoration-rule-strong underline-offset-4 transition-colors hover:text-signal hover:decoration-signal"
            >
              Open the full listings page
            </Link>{" "}
            to try again.
          </p>
        ) : featured.length === 0 ? (
          <p className="mt-12 border border-rule px-5 py-8 text-meta text-ink-muted">
            Nothing is taking requests at the moment. Check back shortly.
          </p>
        ) : (
          <Reveal
            stagger
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {featured.map((property, i) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={i + 1}
                priority={i < 3}
              />
            ))}
          </Reveal>
        )}
      </Section>

      <section className="border-t border-ink">
        <div className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-8 px-gutter py-20">
          <div>
            <p className="font-mono text-micro uppercase tracking-label text-ink-faint">
              For landlords
            </p>
            <h2 className="mt-4 max-w-[20ch] text-h2">
              Put a property in front of tenants who already know the rent.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              Register as a landlord
              <ArrowRight aria-hidden focusable="false" size={16} strokeWidth={1.5} />
            </ButtonLink>
            <ButtonLink href="/login" size="lg" variant="outline">
              Sign in
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

/** Full-viewport band with content vertically centred but free to grow past it. */
function Section({
  id,
  index,
  title,
  first,
  children,
}: {
  id?: string;
  index?: string;
  title?: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`flex min-h-[calc(100dvh-4rem)] scroll-mt-16 flex-col justify-center py-24 ${
        first ? "" : "border-t border-rule"
      }`}
    >
      <div className="mx-auto w-full max-w-shell px-gutter">
        {title && (
          <Reveal>
            <div>
              {index && (
                <p className="font-mono text-micro tabular-nums text-ink-faint">
                  {index}
                </p>
              )}
              <h2 className="mt-3 text-h2">{title}</h2>
            </div>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

/**
 * Directory treatment: a numbered index rather than a wrapped list of links.
 * Only horizontal rules — vertical borders turn this into a table and the
 * whole point is that it reads as an index of places, not a data grid.
 */
