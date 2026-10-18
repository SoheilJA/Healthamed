import type { InputHTMLAttributes } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  value: string;
  onValueChange: (v: string) => void;
  containerClassName?: string;
}

export function SearchInput({
  value,
  onValueChange,
  className,
  containerClassName,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full", containerClassName)}>
      <Search
        className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn("ps-9 pe-9", className)}
        type="search"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => onValueChange("")}
          className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="پاک کردن جستجو"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
