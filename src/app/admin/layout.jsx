import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { Toaster } from "react-hot-toast";
import "@/css/satoshi.css";
import "@/css/style.css";
import { Suspense } from 'react'

export default function RootLayout({ children }) {
    return (
      <html lang="en">                    
        <body suppressHydrationWarning={true}>
        <Suspense fallback={<div>Loading...</div>}>
        <DefaultLayout>
              {children}
            </DefaultLayout>
            <Toaster position="top-right" reverseOrder={false} />
    </Suspense>

        </body>  
      </html>
    );
  }
  