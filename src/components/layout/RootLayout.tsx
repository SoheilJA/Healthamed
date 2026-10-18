import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OfflineBanner } from "./OfflineBanner";
import { InstallPrompt } from "./InstallPrompt";
import { useScrollTop } from "@/hooks";

export function RootLayout() {
  useScrollTop();
  return (
    <TooltipProvider delayDuration={250}>
      <OfflineBanner />
      <div className="min-h-dvh">
        <Outlet />
      </div>
      <InstallPrompt />
      <Toaster
        position="top-center"
        richColors
        dir="rtl"
        theme="system"
        closeButton
      />
    </TooltipProvider>
  );
}
