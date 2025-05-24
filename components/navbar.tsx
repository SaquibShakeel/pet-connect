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
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-8">
            {isNewPostRoute ? (
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            ) : (
              <Link 
                href="/home" 
                className="flex items-center space-x-1.5 sm:space-x-2 transition-colors hover:text-primary group"
              >
                <div className="relative">
                  <PawPrint className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
                  <div className="absolute -inset-1 bg-primary/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-1">
                  <span className="font-bold text-base sm:text-lg leading-none">Pet</span>
                  <span className="font-bold text-base sm:text-lg leading-none bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Social</span>
                </div>
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
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <Link
              href="/notifications"
              className={cn(
                "p-1.5 sm:p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
                pathname === "/notifications" && "bg-muted"
              )}
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <Link
              href="/profile"
              className={cn(
                "p-1.5 sm:p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
                pathname === "/profile" && "bg-muted"
              )}
            >
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <Button
              variant="ghost"
              onClick={() => signOut()}
              className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="ghost"
              className="md:hidden p-1.5 sm:p-2"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
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
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-1 sm:space-y-2">
          {navLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 