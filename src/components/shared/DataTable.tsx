import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "./Pagination";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  align?: "start" | "center" | "end";
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  onSortChange?: (key: string) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Stacked card layout used on small screens. */
  mobileCard: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  total,
  page,
  pageSize,
  onPageChange,
  sortKey,
  sortDir,
  onSortChange,
  loading,
  emptyTitle = "موردی یافت نشد",
  emptyDescription,
  mobileCard,
  onRowClick,
  rowKey,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    col.align === "end" && "text-end",
                    col.align === "center" && "text-center",
                    col.className,
                  )}
                >
                  {col.sortable && onSortChange ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() => onSortChange(col.key)}
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="size-3.5" />
                        ) : (
                          <ArrowDown className="size-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: Math.min(pageSize, 6) }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-5 w-full max-w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!loading &&
              rows.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        col.align === "end" && "text-end",
                        col.align === "center" && "text-center",
                      )}
                    >
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {!loading && rows.length === 0 && (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            className="border-0"
          />
        )}
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 md:hidden">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        {!loading &&
          rows.map((row) => (
            <div
              key={rowKey(row)}
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={() => onRowClick?.(row)}
              onKeyDown={(e) => {
                if (onRowClick && e.key === "Enter") onRowClick(row);
              }}
              className={cn(
                "rounded-xl border bg-card p-4 shadow-sm",
                onRowClick &&
                  "cursor-pointer transition-transform active:scale-[0.99]",
              )}
            >
              {mobileCard(row)}
            </div>
          ))}
        {!loading && rows.length === 0 && (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        )}
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
      />
    </div>
  );
}
