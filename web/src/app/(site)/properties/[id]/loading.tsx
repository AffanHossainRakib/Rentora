import { Bar } from "@/shared/ui";

export default function LoadingProperty() {
  return (
    <div className="mx-auto max-w-shell px-gutter py-12 lg:py-16">
      <p role="status" className="sr-only">
        Loading listing…
      </p>
      <div aria-hidden className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="aspect-[16/10] border border-rule bg-ink/[0.06]" />
          <Bar className="mt-8 h-7 w-3/4" />
          <Bar className="mt-4 w-full max-w-prose" />
          <Bar className="mt-2 w-2/3 max-w-prose" />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="border border-rule bg-surface p-5">
            <Bar className="h-2.5 w-20" />
            <Bar className="mt-3 h-8 w-32" />
            <Bar className="mt-6 h-11 w-full" />
            <Bar className="mt-3 h-11 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
