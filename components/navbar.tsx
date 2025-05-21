"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Home, PawPrint, User, LogOut, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/feed" className="flex items-center space-x-2">
              <PawPrint className="h-6 w-6" />
              <span className="font-bold text-xl">Pet Connect</span>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link
                href="/feed"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/feed"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Home className="h-5 w-5" />
                <span>Feed</span>
              </Link>
              <Link
                href="/pets"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/pets"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PawPrint className="h-5 w-5" />
                <span>Pets</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link
              href="/notifications"
              className={`p-2 rounded-md text-muted-foreground hover:text-foreground ${
                pathname === "/notifications" ? "bg-muted" : ""
              }`}
            >
              <Bell className="h-5 w-5" />
            </Link>
            <Link
              href="/profile"
              className={`p-2 rounded-md text-muted-foreground hover:text-foreground ${
                pathname === "/profile" ? "bg-muted" : ""
              }`}
            >
              <User className="h-5 w-5" />
            </Link>
            <Button
              variant="ghost"
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 