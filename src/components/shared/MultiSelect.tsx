import { useMemo, useState } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  id?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  allowCustom?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  id,
  placeholder = "انتخاب کنید...",
  searchPlaceholder = "جستجو...",
  emptyText = "موردی یافت نشد.",
  allowCustom = false,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => (query ? options.filter((o) => o.includes(query)) : options),
    [options, query],
  );

  const toggle = (item: string) => {
    onChange(
      value.includes(item) ? value.filter((v) => v !== item) : [...value, item],
    );
  };
  const remove = (item: string) => onChange(value.filter((v) => v !== item));
  const addCustom = () => {
    if (query && !value.includes(query)) onChange([...value, query]);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-auto min-h-11 w-full justify-between font-normal"
          >
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <span className="flex flex-wrap items-center gap-1 py-1">
                {value.map((v) => (
                  <Badge key={v} variant="secondary">
                    {v}
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`حذف ${v}`}
                      className="ms-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(v);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          remove(v);
                        }
                      }}
                    >
                      <X className="size-3" />
                    </span>
                  </Badge>
                ))}
              </span>
            )}
            <ChevronDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(24rem,var(--radix-popover-trigger-width))] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>
                {allowCustom && query ? (
                  <button
                    type="button"
                    className="w-full rounded-md px-2 py-1.5 text-sm text-primary hover:bg-accent"
                    onClick={addCustom}
                  >
                    <Plus className="me-1 inline size-4" /> افزودن «{query}»
                  </button>
                ) : (
                  emptyText
                )}
              </CommandEmpty>
              <CommandGroup>
                {filtered.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => toggle(option)}
                  >
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border border-input",
                        value.includes(option) &&
                          "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      {value.includes(option) && (
                        <Check className="size-3" strokeWidth={3} />
                      )}
                    </span>
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
