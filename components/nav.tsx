"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Home, PawPrint, User, LogOut, Bell } from "lucide-react";

export function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <nav className="border-b">
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
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Home className="h-5 w-5" />
                <span>Feed</span>
              </Link>
              <Link
                href="/pets"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/pets"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <PawPrint className="h-5 w-5" />
                <span>Pets</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/notifications"
              className={`p-2 rounded-md text-gray-500 hover:text-gray-900 ${
                pathname === "/notifications" ? "bg-gray-100" : ""
              }`}
            >
              <Bell className="h-5 w-5" />
            </Link>
            <Link
              href="/profile"
              className={`p-2 rounded-md text-gray-500 hover:text-gray-900 ${
                pathname === "/profile" ? "bg-gray-100" : ""
              }`}
            >
              <User className="h-5 w-5" />
            </Link>
            <Button
              variant="ghost"
              onClick={() => signOut()}
              className="text-gray-500 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 