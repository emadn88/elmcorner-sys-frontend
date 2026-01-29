"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Check,
  Moon,
  Sun,
  Menu,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/hooks/use-sidebar";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { positionStart } from "@/lib/rtl-utils";

// Language options
const languages = [
  { code: "en" as const, name: "English", flag: "🇺🇸" },
  { code: "ar" as const, name: "العربية", flag: "🇸🇦" },
];

export function Header() {
  const { isOpen } = useSidebar();
  const { language, direction, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  // Get role display name
  const getRoleDisplayName = () => {
    if (!user) return "";
    const roleMap: Record<string, string> = {
      admin: t("header.role.admin") || "Administrator",
      teacher: t("header.role.teacher") || "Teacher",
      support: t("header.role.support") || "Support",
      accountant: t("header.role.accountant") || "Accountant",
    };
    return roleMap[user.role] || user.role;
  };

  const selectedLanguage = languages.find((lang) => lang.code === language) || languages[0];
  const sidebarWidth = isOpen ? 256 : 80;
  const headerWidth = isOpen ? "calc(100% - 256px)" : "calc(100% - 80px)";
  
  // RTL-aware positioning - on mobile, always full width
  const headerPosition = direction === "rtl" 
    ? { right: `${sidebarWidth}px` }
    : { left: `${sidebarWidth}px` };
  
  const ChevronIcon = direction === "rtl" ? ChevronLeft : ChevronRight;
  const isTeacher = user?.role === "teacher";

  const { toggle } = useSidebar();

  return (
    <header
      className="fixed top-0 z-50 h-16 md:h-20 bg-gradient-to-r from-white via-gray-50/30 to-white backdrop-blur-xl border-b border-gray-100 shadow-sm"
      style={{ 
        position: "fixed",
        top: 0,
        ...headerPosition,
        width: headerWidth,
        minWidth: headerWidth,
        maxWidth: headerWidth,
        transition: `${direction === "rtl" ? "right" : "left"} 0.3s ease-in-out, width 0.3s ease-in-out`,
        willChange: `${direction === "rtl" ? "right" : "left"}, width`,
      }}
      id="main-header"
    >
      <div className="flex h-full items-center justify-between px-3 md:px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={toggle}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs md:text-sm flex-1 min-w-0">
          <span className="text-gray-400 font-medium hidden sm:inline">{t("layout.dashboard")}</span>
          <ChevronIcon className="h-3 w-3 md:h-4 md:w-4 text-gray-300 hidden sm:block" />
          <span className="text-gray-900 font-semibold truncate">{t("layout.overview")}</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search - Hidden for teachers */}
          {!isTeacher && (
            <div className="relative hidden lg:block">
              <Search className={cn(
                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400",
                direction === "rtl" ? "right-3" : "left-3"
              )} />
              <Input
                type="search"
                placeholder={t("layout.searchPlaceholder")}
                className={cn(
                  "w-64 h-9 focus:w-80 transition-all duration-300 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 bg-white/80 backdrop-blur-sm",
                  direction === "rtl" ? "pr-10" : "pl-10"
                )}
              />
            </div>
          )}

          {/* Language Selector - Compact */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-xl">{selectedLanguage.flag}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={direction === "rtl" ? "start" : "end"} className="w-48">
              <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wider">
                {t("common.selectLanguage")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    "flex items-center justify-between cursor-pointer",
                    selectedLanguage.code === lang.code && "bg-emerald-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                  </div>
                  {selectedLanguage.code === lang.code && (
                    <Check className="h-4 w-4 text-emerald-600" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications - Hidden for teachers */}
          {!isTeacher && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-semibold shadow-sm"
                  >
                    3
                  </Badge>
                </button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align={direction === "rtl" ? "start" : "end"} className="w-80">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="text-base font-semibold">
                  {t("common.notifications")}
                </DropdownMenuLabel>
                <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                  {t("layout.markAllAsRead")}
                </button>
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {[
                  {
                    title: t("header.newCourseAssignment"),
                    time: t("header.minutesAgo", { count: 2 }),
                    type: "assignment",
                    unread: true,
                  },
                  {
                    title: t("header.studentSubmittedWork"),
                    time: t("header.hoursAgo", { count: 1 }),
                    type: "submission",
                    unread: true,
                  },
                  {
                    title: t("header.newMessageReceived"),
                    time: t("header.hoursAgo", { count: 3 }),
                    type: "message",
                    unread: false,
                  },
                ].map((notification, index) => (
                  <DropdownMenuItem
                    key={index}
                    className={cn(
                      "flex flex-col items-start gap-1 py-3 cursor-pointer",
                      notification.unread && "bg-emerald-50/50"
                    )}
                  >
                    <div className="flex items-start justify-between w-full">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      {notification.unread && (
                        <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-emerald-600 font-medium cursor-pointer hover:bg-emerald-50/50">
                {t("layout.viewAllNotifications")}
              </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <Avatar className="h-9 w-9 ring-2 ring-emerald-100">
                  <AvatarImage src="/avatar.jpg" alt={user?.name || t("common.user") || "User"} />
                  <AvatarFallback className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold text-gray-900">{user?.name || t("common.user") || "User"}</span>
                  <span className="text-xs text-gray-500">{getRoleDisplayName()}</span>
                </div>
                <ChevronIcon className={cn(
                  "h-4 w-4 text-gray-400 hidden md:block",
                  direction === "rtl" ? "rotate-[-90deg]" : "rotate-90"
                )} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={direction === "rtl" ? "start" : "end"} className="w-64 p-2">
              {/* Profile Header */}
              <div className="px-3 py-4 mb-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-white/20">
                    <AvatarImage src="/avatar.jpg" alt={user?.name || t("common.user") || "User"} />
                    <AvatarFallback className="bg-white/20 text-white font-semibold text-lg">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{user?.name || t("common.user") || "User"}</p>
                    <p className="text-xs text-white/80 truncate">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Theme Toggle */}
              <div className="px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isDarkMode ? (
                      <Moon className="h-4 w-4 text-gray-600" />
                    ) : (
                      <Sun className="h-4 w-4 text-gray-600" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {isDarkMode ? t("header.darkMode") : t("header.lightMode")}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      isDarkMode ? "bg-emerald-600" : "bg-gray-300"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        isDarkMode 
                          ? direction === "rtl" ? "-translate-x-6" : "translate-x-6"
                          : direction === "rtl" ? "-translate-x-1" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem 
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 mt-1"
              >
                <div className="p-1.5 rounded-lg bg-red-100">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{t("common.logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

