import "@/css/globals.css";
import "@/css/shadcn.css";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/shadcn/ui/toaster";
import NotificationHandler from "@/components/NotificationHandler";
import useAuthorization from "@/components/hooks/useAuthorization";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Nexx Reviews", template: "%s | Nexx Reviews" },
  description: "Review nexpid!",
  themeColor: "#e2e8f0",
  colorScheme: "light dark",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/images/icon-light.png",
        href: "/images/icon-light.png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/images/icon-dark.png",
        href: "/images/icon-dark.png",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authorization = await useAuthorization();

  return (
    <html lang="en">
      <meta name="darkreader-lock" />
      <body className={inter.className}>
        <Navbar suspended={authorization?.state.suspended ?? false} />
        <main className="w-full h-full bg-gradient-to-b bg-no-repeat from-zinc-200 to-white text-zinc-800 dark:from-zinc-900 dark:to-zinc-950 dark:text-zinc-200 min-h-screen flex flex-col justify-center items-center gap-3 px-6 xl:px-24 md:px-12">
          {children}
          <NotificationHandler isAuth={!!authorization} />
        </main>
        <Toaster />
      </body>
    </html>
  );
}
