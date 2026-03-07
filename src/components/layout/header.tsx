"use client";

import Link from "next/link";
import Image from "next/image";
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
import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-notifications";
import { useConversations } from "@/hooks/use-chat";
import { signOutUser } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Header() {
  const { t, setLocale, locale } = useLocale();

  const LANGUAGES = [
    { code: "en" as const, label: "English", flag: "🇬🇧" },
    { code: "fr" as const, label: "Français", flag: "🇫🇷" },
    { code: "es" as const, label: "Español", flag: "🇪🇸" },
    { code: "it" as const, label: "Italiano", flag: "🇮🇹" },
    { code: "pt" as const, label: "Português", flag: "🇵🇹" },
  ];
  const currentLang = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  const { isLoggedIn, user, uid } = useAuth();
  const userRole = user?.role ?? null;
  const userName = user?.profile?.fullName || "User";
  const userImage = user?.profile?.profileImage;
  const unreadCount = useUnreadCount();
  const { data: conversations } = useConversations();
  const hasUnreadChat = (conversations || []).some(c => c.lastSenderId && c.lastSenderId !== uid);

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
    // { href: "/blog", label: t.nav.blog },
    { href: "/pricing", label: t.nav.pricing },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-md  transition-colors duration-300 ${isScrolled ? "bg-white/80 border-border/50" : "bg-transparent border-border/30"
      }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/website-logo.png"
              alt="Nouryx"
              width={140}
              height={36}
              className="h-9 w-auto"
              priority
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md px-2 py-1 hover:bg-accent">
                  <Globe className="h-4 w-4" />
                  <span>{currentLang.flag} {currentLang.label}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLocale(lang.code)}
                    className={`flex items-center gap-2.5 cursor-pointer ${locale === lang.code ? "text-[#C9AA8B] font-semibold" : ""
                      }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span className="flex-1">{lang.label}</span>
                    {locale === lang.code && <span className="text-[#C9AA8B] text-xs">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2" aria-label="User menu">
                    <div className="h-7 w-7 rounded-full bg-[#C9AA8B] flex items-center justify-center overflow-hidden">
                      {userImage ? (
                        <Image src={userImage} alt={userName} width={28} height={28} className="object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium hidden lg:inline">{userName.split(' ')[0]}</span>
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
                        <Link href="/user/profile" className="flex items-center gap-2">
                          <User className="h-4 w-4" /> {t.nav.profile}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/user/bookings" className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" /> {t.nav.bookings}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/user/profile/favorites" className="flex items-center gap-2">
                          <Heart className="h-4 w-4" /> {t.nav.favorites}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/notifications" className="flex items-center gap-2">
                          <Bell className="h-4 w-4" /> {t.nav.notifications}
                          {(unreadCount ?? 0) > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-1">{unreadCount}</span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/chat" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" /> {t.nav.chat}
                          {hasUnreadChat && (
                            <span className="ml-auto h-2.5 w-2.5 rounded-full bg-[#25D366] shrink-0" />
                          )}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/user/profile/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" /> {t.nav.settings}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 text-destructive cursor-pointer" onClick={async () => { await signOutUser(); toast.success("Signed out"); router.push("/"); }}>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm text-muted-foreground p-2 hover:text-foreground transition-colors">
                  <span className="text-base">{currentLang.flag}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLocale(lang.code)}
                    className={`flex items-center gap-2.5 cursor-pointer ${locale === lang.code ? "text-[#C9AA8B] font-semibold" : ""
                      }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span className="flex-1">{lang.label}</span>
                    {locale === lang.code && <span className="text-[#C9AA8B] text-xs">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Toggle mobile menu">
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
                        href={userRole === "salon" ? "/dashboard" : "/user/profile"}
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 text-sm font-medium text-foreground hover:bg-accent rounded-lg"
                      >
                        {userRole === "salon" ? t.nav.dashboard : t.nav.profile}
                      </Link>
                      <Link
                        href="/user/bookings"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 text-sm font-medium text-foreground hover:bg-accent rounded-lg"
                      >
                        {t.nav.bookings}
                      </Link>
                      <Link
                        href="/chat"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 text-sm font-medium text-foreground hover:bg-accent rounded-lg flex items-center justify-between"
                      >
                        {t.nav.chat}
                        {hasUnreadChat && (
                          <span className="h-2.5 w-2.5 rounded-full bg-[#25D366] shrink-0" />
                        )}
                      </Link>
                      <button className="px-4 py-3 text-sm font-medium text-destructive hover:bg-accent rounded-lg text-left" onClick={async () => { setMobileOpen(false); await signOutUser(); toast.success("Signed out"); router.push("/"); }}>
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
