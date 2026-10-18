import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  onBack?: () => void;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  onBack,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div
      className={cn(
        "mb-5 flex flex-wrap items-start justify-between gap-3",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (onBack ? onBack() : navigate(-1))}
            aria-label="بازگشت"
          >
            <ChevronRight className="size-5" />
          </Button>
        )}
        {Icon && (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
