import { cn } from "@/shared/lib/cn";

export function Panel({
  children,
  className,
  as: Tag = "section",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "aside";
}) {
  return (
    <Tag className={cn("border border-rule bg-surface", className)}>
      {children}
    </Tag>
  );
}

export function PanelHeader({
  title,
  index,
  action,
  description,
}: {
  title: string;
  index?: string;
  action?: React.ReactNode;
  description?: string;
}) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-rule px-5 py-4">
      <div className="min-w-0">
        <h2 className="flex items-baseline gap-2.5 text-h4 text-ink">
          {index && (
            <span className="font-mono text-micro text-ink-faint">{index}</span>
          )}
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-meta text-ink-muted">{description}</p>
        )}
      </div>
      {action}
    </header>
  );
}
