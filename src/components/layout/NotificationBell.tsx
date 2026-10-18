import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { notificationService } from "@/services";
import { useAuthStore } from "@/stores";
import { relativeTime } from "@/lib/jalali";
import { toPersianDigits } from "@/lib/persian";
import { cn } from "@/lib/utils";

export function useNotifications() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => notificationService.listMine(user!.id),
    enabled: !!user,
    refetchInterval: 60_000,
  });
}

export function NotificationBell({ linkBase }: { linkBase: string }) {
  const user = useAuthStore((s) => s.user);
  const { data } = useNotifications();
  const qc = useQueryClient();
  const markAll = useMutation({
    mutationFn: () => notificationService.markAllRead(user!.id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  });

  if (!user) return null;
  const unread = data?.filter((n) => !n.read).length ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unread > 0
              ? `اعلان‌ها، ${toPersianDigits(unread)} خوانده‌نشده`
              : "اعلان‌ها"
          }
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -end-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unread > 9 ? "۹+" : toPersianDigits(unread)}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <p className="text-sm font-semibold">اعلان‌ها</p>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
            >
              خواندن همه
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {(data ?? []).slice(0, 8).map((n) => (
            <div
              key={n.id}
              className={cn(
                "border-b p-3 text-sm last:border-0",
                !n.read && "bg-accent/50",
              )}
            >
              <p className="font-medium">{n.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                {n.body}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {relativeTime(n.at)}
              </p>
            </div>
          ))}
          {data && data.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              اعلانی ندارید.
            </p>
          )}
        </div>
        <div className="border-t p-2">
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link to={`${linkBase}/notifications`}>مشاهده همه اعلان‌ها</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
