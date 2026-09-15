const CARDS = [0, 1, 2, 3, 4, 5, 6, 7];

export default function LoadingProperties() {
  return (
    <div className="mx-auto max-w-shell px-gutter py-12 lg:py-16">
      <p role="status" className="sr-only">
        Loading listings…
      </p>

      <div aria-hidden>
        <div className="border-b border-ink pb-3">
          <div className="h-3 w-24 bg-ink/[0.08]" />
          <div className="mt-4 h-8 w-72 bg-ink/[0.08]" />
          <div className="mt-4 h-3 w-full max-w-prose bg-ink/[0.06]" />
        </div>

        <div className="mt-8 h-32 border border-rule bg-surface sm:h-24" />

        <div className="mt-10 flex items-baseline justify-between border-b border-rule pb-3">
          <div className="h-3 w-40 bg-ink/[0.06]" />
          <div className="h-3 w-28 bg-ink/[0.06]" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CARDS.map((card) => (
            <div key={card} className="border border-rule bg-surface">
              <div className="aspect-[4/3] bg-ink/[0.06]" />
              <div className="flex flex-col gap-3 p-4">
                <div className="h-2.5 w-24 bg-ink/[0.08]" />
                <div className="h-4 w-full bg-ink/[0.08]" />
                <div className="mt-1 flex items-center justify-between border-t border-rule pt-3">
                  <div className="h-2.5 w-16 bg-ink/[0.06]" />
                  <div className="h-4 w-20 bg-ink/[0.08]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
