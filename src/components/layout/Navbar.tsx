"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  LogOut,
  User,
  LayoutDashboard,
  Menu,
  X,
  CreditCard,
  Settings,
  ChevronDown,
  Users,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { OrganizationSwitcher } from "@/components/organizations/OrganizationSwitcher";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-zinc-100 dark:border-zinc-900 h-[80px]">
      <div className="max-w-[1440px] mx-auto px-8 h-full flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-[20px] bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 font-black text-2xl shadow-2xl group-hover:scale-110 active:scale-95 transition-all duration-500 ring-4 ring-transparent group-hover:ring-zinc-950/5 dark:group-hover:ring-white/10">
            C
          </div>
          <span className="font-black text-2xl tracking-tighter text-zinc-900 dark:text-white uppercase transition-opacity hidden sm:block">
            CMS
            <span className="text-zinc-400 dark:text-zinc-600 ml-1">BLOG</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-12">
          <Link
            href="/authors"
            className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:text-black dark:hover:text-white active:scale-95 ${
              pathname === "/authors"
                ? "text-black dark:text-white"
                : "text-zinc-400 dark:text-zinc-500"
            }`}>
            AUTHORS
          </Link>

          {!isPending && (
            <>
              {session ? (
                <div className="flex items-center gap-10">
                  <Link
                    href="/dashboard"
                    className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:text-black dark:hover:text-white active:scale-95 ${
                      pathname.startsWith("/dashboard")
                        ? "text-black dark:text-white"
                        : "text-zinc-400 dark:text-zinc-500"
                    }`}>
                    DASHBOARD
                  </Link>

                  <div className="h-4 w-px bg-zinc-100 dark:bg-zinc-800" />

                  <OrganizationSwitcher />

                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-4 p-1 rounded-2xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 group">
                      <div className="w-10 h-10 rounded-[14px] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 ring-1 ring-zinc-100 dark:ring-zinc-800 group-hover:ring-zinc-950 dark:group-hover:ring-white transition-all overflow-hidden shadow-sm">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={20} strokeWidth={2.5} />
                        )}
                      </div>
                      <ChevronDown
                        size={14}
                        strokeWidth={3}
                        className={`text-zinc-400 dark:text-zinc-600 transition-transform duration-500 ${isProfileOpen ? "rotate-180 text-zinc-950 dark:text-white" : ""}`}
                      />
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-6 w-80 rounded-[32px] bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 shadow-[0_20px_60px_rgba(0,0,0,0.1)] py-5 animate-in fade-in zoom-in-95 duration-300 origin-top-right ring-1 ring-zinc-100/50 dark:ring-zinc-800/10 p-3">
                        <div className="px-6 py-5 border-b border-zinc-50 dark:border-zinc-900 mb-4 space-y-1">
                          <p className="text-lg font-black text-zinc-900 dark:text-white truncate tracking-tight">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold truncate tracking-widest uppercase">
                            {session.user.email}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group/item"
                            onClick={() => setIsProfileOpen(false)}>
                            <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 group-hover/item:bg-zinc-900 dark:group-hover/item:bg-white group-hover/item:text-white dark:group-hover/item:text-zinc-950 transition-all">
                              <LayoutDashboard size={18} />
                            </div>
                            Platform Overview
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            className="flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group/item w-full text-left"
                            onClick={() => setIsProfileOpen(false)}>
                            <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 group-hover/item:bg-zinc-900 dark:group-hover/item:bg-white group-hover/item:text-white dark:group-hover/item:text-zinc-950 transition-all">
                              <Settings size={18} />
                            </div>
                            Identity Settings
                          </Link>
                        </div>

                        <div className="border-t border-zinc-50 dark:border-zinc-900 mt-4 pt-4">
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsProfileOpen(false);
                            }}
                            className="flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 w-full text-left transition-all group/logout">
                            <div className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 group-hover/logout:bg-red-600 group-hover/logout:text-white transition-all">
                              <LogOut size={18} />
                            </div>
                            Terminate Session
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-8">
                  <Link
                    href="/login"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-all active:scale-95">
                    AUTHENTICATE
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-zinc-950 dark:bg-white dark:text-zinc-950 rounded-[18px] hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                    INITIALIZE
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white transition-all active:scale-90 border border-zinc-100 dark:border-zinc-800 shadow-sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? (
            <X size={24} strokeWidth={3} />
          ) : (
            <Menu size={24} strokeWidth={3} />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[80px] z-40 md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-3xl p-8 animate-in slide-in-from-bottom duration-500 flex flex-col gap-12">
          {session ? (
            <div className="flex flex-col h-full gap-12">
              <div className="space-y-4">
                <div className="flex items-center gap-6 p-6 rounded-[32px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-2xl">
                  <div className="w-20 h-20 rounded-[24px] bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 font-black text-3xl overflow-hidden shadow-2xl ring-4 ring-zinc-50 dark:ring-zinc-800">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      session.user.name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-2xl text-zinc-900 dark:text-white leading-tight tracking-tight">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-6 px-8 py-7 rounded-[32px] text-2xl font-black text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border border-zinc-100 dark:border-zinc-800"
                  onClick={() => setIsMenuOpen(false)}>
                  <LayoutDashboard size={28} strokeWidth={2.5} />
                  Dashboard
                </Link>
                <Link
                  href="/authors"
                  className="flex items-center gap-6 px-8 py-7 rounded-[32px] text-2xl font-black text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border border-zinc-100 dark:border-zinc-800"
                  onClick={() => setIsMenuOpen(false)}>
                  <Users size={28} strokeWidth={2.5} />
                  Authors
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-6 px-8 py-7 rounded-[32px] text-2xl font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 transition-all text-left border border-red-100/50 dark:border-red-500/20">
                  <LogOut size={28} strokeWidth={2.5} />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 mt-12">
              <Link
                href="/login"
                className="w-full text-center py-8 rounded-[32px] bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-black text-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border border-zinc-100 dark:border-zinc-800"
                onClick={() => setIsMenuOpen(false)}>
                AUTHENTICATE
              </Link>
              <Link
                href="/register"
                className="w-full text-center py-8 rounded-[32px] bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-2xl hover:opacity-90 shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all"
                onClick={() => setIsMenuOpen(false)}>
                INITIALIZE
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

