"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Home, PawPrint, User, LogOut, Bell, Globe, Menu, X, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!session?.user) return null;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isNewPostRoute = pathname?.includes('/pets/') && pathname?.includes('/social/new-post');

  const navLinks = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/pets", icon: PawPrint, label: "Pets" },
    { href: "/explore", icon: Globe, label: "Explore" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            {isNewPostRoute ? (
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </Button>
            ) : (
              <Link href="/home" className="flex items-center space-x-2 transition-colors hover:text-primary">
                <PawPrint className="h-6 w-6" />
                <span className="font-bold text-xl">Pet Connect</span>
              </Link>
            )}
            <div className="hidden md:flex space-x-6">
              {navLinks.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === href
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link
              href="/notifications"
              className={cn(
                "p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
                pathname === "/notifications" && "bg-muted"
              )}
            >
              <Bell className="h-5 w-5" />
            </Link>
            <Link
              href="/profile"
              className={cn(
                "p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
                pathname === "/profile" && "bg-muted"
              )}
            >
              <User className="h-5 w-5" />
            </Link>
            <Button
              variant="ghost"
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden transition-all duration-300 ease-in-out",
          isMobileMenuOpen
            ? "max-h-64 opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <div className="container mx-auto px-4 py-4 space-y-2">
          {navLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 