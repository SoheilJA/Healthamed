import { Link } from "react-router-dom";
import { CloudOff, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePageTitle } from "@/hooks";

export default function OfflinePage() {
  usePageTitle("حالت آفلاین");
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-warning/15">
            <CloudOff className="size-7 text-warning" />
          </div>
          <CardTitle>شما در حالت آفلاین هستید</CardTitle>
          <CardDescription>اتصال اینترنت دستگاه شما قطع است.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="success">
            <Siren />
            <AlertTitle>این اطلاعات بدون اینترنت در دسترس هستند</AlertTitle>
            <AlertDescription>
              کارت اورژانس، آخرین نسخه‌ها و کدهای پیگیری، جزئیات نوبت‌های پیش رو
              و تماس‌های اضطراری به‌صورت آفلاین ذخیره شده‌اند.
            </AlertDescription>
          </Alert>
          <Alert variant="warning">
            <CloudOff />
            <AlertTitle>این قابلیت‌ها نیاز به اینترنت دارند</AlertTitle>
            <AlertDescription>
              گفتگوی ویزیت، رزرو نوبت جدید و ثبت سفارش دارو تا وصل شدن اینترنت
              غیرفعال هستند.
            </AlertDescription>
          </Alert>
          <Button asChild className="w-full">
            <Link to="/app/emergency">مشاهده کارت اورژانس</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
