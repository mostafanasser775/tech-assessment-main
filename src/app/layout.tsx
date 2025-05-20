import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Providers } from "@/components/providers";
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: "Next.js Auth App",
  description: "A Next.js application with authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NextTopLoader 
            color="#2563eb"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #2563eb,0 0 5px #2563eb"
          />
          <Navigation />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
