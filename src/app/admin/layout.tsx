import DefaultLayout from "@/components/Layouts/DefaultLaout";
// import { Toaster } from "react-hot-toast";
import "@/css/satoshi.css";
// import "@/css/style.css";
import '@/app/globals.css'
import { Suspense } from "react";
import { AuthProvider } from "@/provider/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from "@/components/providers/NotificationProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <NotificationProvider>
              <DefaultLayout>{children}</DefaultLayout>
              <Toaster />
            </NotificationProvider>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
