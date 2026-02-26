"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Globe, ChevronDown, User, LogOut, Heart, Bell, MessageSquare, CalendarDays, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/hooks/use-locale";

export function Header() {
  const { t, toggleLocale, locale } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Mock auth state — replace with real auth later
  const isLoggedIn = false;
  const userRole: "user" | "salon" | null = null;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/salons", label: t.nav.salons },
    { href: "/pricing", label: t.nav.pricing },
    { href: "/about", label: t.nav.about },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-md  transition-colors duration-300 ${
      isScrolled ? "bg-white/80 border-border/50" : "bg-transparent border-border/30"
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/images/website-logo.png"
              alt="Nouryx"
              className="h-9 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="h-4 w-4" />
              {locale === "fr" ? "EN" : "FR"}
            </button>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#C9AA8B] flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {userRole === "salon" ? (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">{t.nav.dashboard}</Link>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center gap-2">
                          <User className="h-4 w-4" /> {t.nav.profile}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/bookings" className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" /> {t.nav.bookings}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile/favorites" className="flex items-center gap-2">
                          <Heart className="h-4 w-4" /> {t.nav.favorites}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/notifications" className="flex items-center gap-2">
                          <Bell className="h-4 w-4" /> {t.nav.notifications}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/chat" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" /> {t.nav.chat}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" /> {t.nav.settings}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 text-destructive">
                    <LogOut className="h-4 w-4" /> {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-sm font-medium hover:cursor-pointer">
                    {t.nav.login}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="sm"
                    className="bg-[#B8956F] hover:bg-[#C9AA8B] hover:cursor-pointer text-white text-sm font-medium rounded-lg py-5"
                  >
                    {t.nav.listBusiness}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleLocale}
              className="text-sm text-muted-foreground p-2"
            >
              {locale === "fr" ? "EN" : "FR"}
            </button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 pt-12">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="my-3 border-t border-border" />
                  {isLoggedIn ? (
                    <>
                      <Link
                        href={userRole === "salon" ? "/dashboard" : "/profile"}
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 text-sm font-medium text-foreground hover:bg-accent rounded-lg"
                      >
                        {userRole === "salon" ? t.nav.dashboard : t.nav.profile}
                      </Link>
                      <Link
                        href="/bookings"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 text-sm font-medium text-foreground hover:bg-accent rounded-lg"
                      >
                        {t.nav.bookings}
                      </Link>
                      <Link
                        href="/chat"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 text-sm font-medium text-foreground hover:bg-accent rounded-lg"
                      >
                        {t.nav.chat}
                      </Link>
                      <button className="px-4 py-3 text-sm font-medium text-destructive hover:bg-accent rounded-lg text-left">
                        {t.nav.logout}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 text-sm font-medium text-foreground hover:bg-accent rounded-lg"
                      >
                        {t.nav.login}
                      </Link>
                      <div className="px-4 pt-2">
                        <Link href="/signup" onClick={() => setMobileOpen(false)}>
                          <Button className="w-full bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-lg">
                            {t.nav.listBusiness}
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
