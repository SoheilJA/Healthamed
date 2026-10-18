import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian";

interface RatingStarsProps {
  value: number;
  count?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}

export function RatingStars({
  value,
  count,
  size = 16,
  showValue = false,
  className,
}: RatingStarsProps) {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      aria-label={`امتیاز ${toPersianDigits(value)} از ۵`}
    >
      <div className="flex items-center gap-0.5" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            style={{ width: size, height: size }}
            className={cn(
              star <= Math.round(value)
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground/30",
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold">
          {toPersianDigits(value.toFixed(1))}
        </span>
      )}
      {typeof count === "number" && (
        <span className="text-xs text-muted-foreground">
          ({toPersianDigits(count)} نظر)
        </span>
      )}
    </div>
  );
}
