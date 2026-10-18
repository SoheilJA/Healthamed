import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <nav className="flex items-center gap-1" aria-label="صفحه‌بندی">
        <Button
          variant="outline"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          aria-label="اولین صفحه"
        >
          <ChevronsRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="صفحه قبل"
        >
          <ChevronRight className="size-4" />
        </Button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`dots-${i}`} className="px-1 text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              aria-label={`صفحه ${toPersianDigits(p)}`}
            >
              {toPersianDigits(p)}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="صفحه بعد"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="آخرین صفحه"
        >
          <ChevronsLeft className="size-4" />
        </Button>
      </nav>
      <p className="text-xs text-muted-foreground">
        نمایش {toPersianDigits((page - 1) * pageSize + 1)} تا{" "}
        {toPersianDigits(Math.min(page * pageSize, total))} از{" "}
        {toPersianDigits(total)} مورد
      </p>
    </div>
  );
}
