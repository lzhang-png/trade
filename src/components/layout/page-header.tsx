import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 pb-2 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="size-6 text-foreground" />}
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        </div>
        {description && (
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
