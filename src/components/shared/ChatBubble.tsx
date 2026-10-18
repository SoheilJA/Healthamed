import type { ReactNode } from "react";
import {
  Check,
  CheckCheck,
  Download,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import type { Message } from "@/types";
import { cn, formatBytes } from "@/lib/utils";
import { formatTime } from "@/lib/jalali";

interface ChatBubbleProps {
  message: Message;
  own: boolean;
  senderName: string;
  onDownload?: () => void;
  /** Custom content (e.g. prescription card) rendered inside the bubble. */
  children?: ReactNode;
}

export function ChatBubble({
  message: msg,
  own,
  senderName,
  onDownload,
  children,
}: ChatBubbleProps) {
  if (msg.type === "system") {
    return (
      <div className="my-2 text-center">
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {msg.text}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn("flex w-full flex-col", own ? "items-end" : "items-start")}
    >
      {!own && (
        <span className="mb-0.5 ps-1 text-[11px] font-medium text-muted-foreground">
          {senderName}
        </span>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 shadow-sm md:max-w-[70%]",
          own
            ? "rounded-se-md bg-primary text-primary-foreground"
            : "rounded-ss-md border bg-card",
        )}
      >
        {msg.type === "text" && (
          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
        )}

        {msg.type === "image" && (
          <div className="space-y-1">
            <div className="flex size-40 items-center justify-center rounded-lg bg-black/5 text-muted-foreground dark:bg-white/10">
              <ImageIcon className="size-8" />
            </div>
            <p className="text-xs opacity-70">{msg.fileName}</p>
          </div>
        )}

        {msg.type === "file" && (
          <button
            type="button"
            onClick={onDownload}
            className="flex w-full items-center gap-2 rounded-lg border border-current/20 p-2 text-start"
          >
            <FileText className="size-8 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{msg.fileName}</span>
              <span className="block text-xs opacity-70">
                {msg.fileSize ? formatBytes(msg.fileSize) : ""}
              </span>
            </span>
            <Download className="size-4 shrink-0" />
          </button>
        )}

        {(msg.type === "prescription" || children) && children}
      </div>
      <span className="mt-0.5 flex items-center gap-1 px-1 text-[10px] text-muted-foreground">
        {formatTime(msg.createdAt)}
        {own && (
          <>
            {(msg.status === "delivered" || msg.status === "read") && (
              <CheckCheck className="size-3.5" />
            )}
            {msg.status === "read" && (
              <span className="sr-only">خوانده شد</span>
            )}
            {msg.status === "sent" && <Check className="size-3.5" />}
          </>
        )}
      </span>
    </div>
  );
}
