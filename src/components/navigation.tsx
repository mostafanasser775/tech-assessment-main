"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

export function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <header className="mx-4 border-b">
      <div className="flex justify-between items-center py-4 h-16 container">
        <div className="flex items-center gap-6 md:gap-10">
          <Link
            href="/"
            className="font-bold text-xl"
          >
            Blurr.so | HR Portal
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <div className="flex gap-2">
              <Skeleton className="w-[80px] h-9" />
              <Skeleton className="w-[80px] h-9" />
            </div>
          ) : !session && pathname !== "/login" && pathname !== "/register" ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          ) : session?.user && (
            <div className="flex items-center gap-2">
              <span className="mr-2 text-sm">{session.user.name || session.user.email}</span>
              <Button
                variant="outline"
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                }}
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
