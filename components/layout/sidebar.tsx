"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PackageService } from "@/lib/services/package.service";
import {
  Home,
  BookOpen,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Clock,
  FlaskConical,
  Package,
  CreditCard,
  ClipboardCheck,
  DollarSign,
  Activity,
  CalendarDays,
  CalendarClock,
  Bell,
  Wallet,
  TrendingUp,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { usePermission, useRole } from "@/hooks/usePermission";
import { NavGroup } from "@/types";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Navigation structure - labels will be translated in component
const getNavGroups = (t: (key: string) => string, packageNotificationCount?: number, userRole?: string): NavGroup[] => {
  // Teacher-specific navigation
  if (userRole === 'teacher') {
    return [
      {
        title: t("sidebar.main"),
        items: [
          { label: t("layout.dashboard"), href: "/dashboard/teacher", icon: Home, role: "teacher" },
        ],
      },
      {
        title: t("sidebar.teaching") || "Teaching",
        items: [
          { label: t("sidebar.myClasses") || "My Classes", href: "/dashboard/teacher/classes", icon: CalendarDays, role: "teacher" },
          { label: t("sidebar.myStudents") || "My Students", href: "/dashboard/teacher/students", icon: Users, role: "teacher" },
          { label: t("sidebar.trials") || "Trials", href: "/dashboard/teacher/trials", icon: FlaskConical, role: "teacher" },
          { label: t("sidebar.availability") || "Availability", href: "/dashboard/teacher/availability", icon: Clock, role: "teacher" },
          { label: t("sidebar.calendar") || "Calendar", href: "/dashboard/teacher/calendar", icon: CalendarDays, role: "teacher" },
        ],
      },
    ];
  }

  // Admin navigation
  return [
  {
    title: t("sidebar.main"),
    items: [
      { label: t("layout.dashboard"), href: "/dashboard", icon: Home },
    ],
  },
  {
    title: t("sidebar.people"),
    items: [
      {
        label: t("sidebar.students"),
        href: "/dashboard/students",
        icon: Users,
        permission: "view_students",
      },
      {
        label: t("sidebar.families"),
        href: "/dashboard/families",
        icon: Users,
        permission: "view_students",
      },
      {
        label: t("sidebar.leads"),
        href: "/dashboard/leads",
        icon: Target,
        permission: "view_students",
      },
      {
        label: t("sidebar.teachers"),
        href: "/dashboard/teachers",
        icon: UserCheck,
        permission: "view_teachers",
      },
      {
        label: t("sidebar.teacherPanel"),
        href: "/dashboard/teacher",
        icon: GraduationCap,
        role: "teacher",
      },
    ],
  },
  {
    title: t("sidebar.learning"),
    items: [
      {
        label: t("sidebar.courses"),
        href: "/dashboard/courses",
        icon: BookOpen,
        permission: "view_courses",
      },
      {
        label: t("sidebar.trialClasses"),
        href: "/dashboard/trial-classes",
        icon: FlaskConical,
        permission: "view_timetables",
      },
    ],
  },
  {
    title: t("sidebar.academic"),
    items: [
      { label: "Calendy", href: "/dashboard/calendy", icon: CalendarClock, permission: "view_timetables" },
      { label: t("sidebar.classes") || "Classes", href: "/dashboard/classes", icon: CalendarDays, permission: "view_timetables" },
      { label: t("sidebar.timetables"), href: "/dashboard/timetables", icon: Clock, permission: "view_timetables" },
      {
        label: t("sidebar.packages"),
        href: "/dashboard/packages",
        icon: Package,
        permission: "view_students",
      },
      {
        label: t("sidebar.notifications") || "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
        permission: "view_students",
        badge: packageNotificationCount > 0 ? packageNotificationCount : undefined,
      },
      {
        label: t("sidebar.billing"),
        href: "/dashboard/billing",
        icon: CreditCard,
        permission: "view_billing",
      },
      {
        label: t("sidebar.duties"),
        href: "/dashboard/duties",
        icon: ClipboardCheck,
        permission: "view_students",
      },
      {
        label: t("sidebar.reports"),
        href: "/dashboard/reports",
        icon: BarChart3,
        permission: "view_reports",
      },
      {
        label: t("sidebar.financials"),
        href: "/dashboard/financials",
        icon: DollarSign,
        permission: "view_financials",
      },
      {
        label: t("sidebar.salaries") || "Salaries",
        href: "/dashboard/salaries",
        icon: Wallet,
        permission: "view_teachers",
      },
      {
        label: t("sidebar.activity"),
        href: "/dashboard/activity",
        icon: Activity,
        permission: "view_students",
      },
      {
        label: t("sidebar.studentActivity") || "Student Activity",
        href: "/dashboard/student-activity",
        icon: TrendingUp,
        permission: "view_students",
      },
    ],
  },
  {
    title: t("sidebar.system"),
    items: [
      { label: t("sidebar.settings"), href: "/dashboard/settings", icon: Settings },
    ],
  },
  ];
};

// NavItem component with dropdown support
function NavItemComponent({
  item,
  isOpen,
  pathname,
  direction,
}: {
  item: NavGroup["items"][0];
  isOpen: boolean;
  pathname: string;
  direction: "ltr" | "rtl";
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  // Check if current path matches the item href or starts with it (for dynamic routes like /dashboard/students/[id])
  // For dashboard routes, only match exactly to avoid matching sub-routes
  const isDashboardRoute = item.href === "/dashboard" || item.href === "/dashboard/teacher";
  const isActive = pathname === item.href ||
    (!isDashboardRoute && item.href !== "/dashboard" && pathname.startsWith(item.href + "/")) ||
    (hasChildren && item.children?.some(child => pathname === child.href || pathname.startsWith(child.href + "/")));
  const Icon = item.icon;
  const ChevronIcon = direction === "rtl" ? ChevronLeft : ChevronRight;

  // Auto-expand if any child is active
  useEffect(() => {
    if (hasChildren && item.children?.some(child => pathname === child.href || pathname.startsWith(child.href + "/"))) {
      setIsExpanded(true);
    }
  }, [pathname, hasChildren, item.children]);

  if (!isOpen) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "relative flex items-center justify-center w-12 h-12 rounded-lg text-sm font-medium transition-all duration-200 mx-auto",
              "hover:bg-emerald-900/30",
              isActive
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                : "text-gray-300 hover:text-white hover:bg-emerald-900/30"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "text-white")} />
            {item.badge && item.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{item.label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div>
      {hasChildren ? (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              "hover:bg-gray-100",
              isActive
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                : "text-gray-300 hover:text-white hover:bg-emerald-900/30"
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-white")} />
            <span className={cn("truncate flex-1", direction === "rtl" ? "text-right" : "text-left")}>
              {item.label}
            </span>
            {item.badge && (
              <span className={cn(
                "bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center",
                direction === "rtl" ? "mr-auto" : "ml-auto"
              )}>
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
            <motion.div
              animate={{ rotate: isExpanded ? (direction === "rtl" ? -90 : 90) : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0"
            >
              <ChevronIcon className={cn("h-4 w-4", isActive && "text-white")} />
            </motion.div>
          </button>
          <AnimatePresence>
            {isExpanded && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className={cn("mt-1 space-y-1", direction === "rtl" ? "pr-4" : "pl-4")}>
                  {item.children?.map((child) => {
                    const ChildIcon = child.icon;
                    // Check if current path matches child href or starts with it (for dynamic routes)
                    const isChildActive = pathname === child.href ||
                      (child.href !== "/dashboard" && pathname.startsWith(child.href + "/"));
                    return (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                            "hover:bg-gray-100",
                            isChildActive
                              ? "bg-emerald-900/40 text-emerald-300 font-medium border-l-2 border-emerald-500"
                              : "text-gray-400 hover:text-white hover:bg-emerald-900/20"
                          )}
                        >
                          <ChildIcon className={cn("h-4 w-4 shrink-0", isChildActive && "text-emerald-300")} />
                          <span className={cn("truncate flex-1", direction === "rtl" ? "text-right" : "text-left")}>
                            {child.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </div>
              </motion.ul>
            )}
          </AnimatePresence>
        </>
      ) : (
        <Link
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            "hover:bg-gray-100",
            isActive
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
              : "text-gray-300 hover:text-white hover:bg-emerald-900/30"
          )}
        >
          <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-white")} />
          <span className={cn("truncate flex-1", direction === "rtl" ? "text-right" : "text-left")}>
            {item.label}
          </span>
          {item.badge && (
            <span className={cn(
              "bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0 min-w-[20px] text-center",
              direction === "rtl" ? "mr-auto" : "ml-auto"
            )}>
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </Link>
      )}
    </div>
  );
}

// Helper function to filter nav items based on permissions
function filterNavItems(items: NavGroup["items"], hasPermission: (perm: string) => boolean, hasRole: (role: string) => boolean): NavGroup["items"] {
  return items
    .filter((item) => {
      // Check permission if required
      if (item.permission && !hasPermission(item.permission)) {
        return false;
      }
      // Check role if required
      if (item.role && !hasRole(item.role)) {
        return false;
      }
      // If no permission or role required, show item
      return true;
    })
    .map((item) => {
      // Filter children if they exist
      if (item.children) {
        const filteredChildren = filterNavItems(item.children, hasPermission, hasRole);
        // Only include parent if it has visible children or no permission requirement
        if (filteredChildren.length === 0 && item.permission) {
          return null;
        }
        // Preserve badge when mapping
        return { ...item, children: filteredChildren, badge: item.badge };
      }
      // Preserve badge when mapping
      return { ...item, badge: item.badge };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle, isMounted } = useSidebar();
  const { direction, t } = useLanguage();
  const { user } = useAuth();
  const [packageNotificationCount, setPackageNotificationCount] = useState<number>(0);

  // Fetch package notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const count = await PackageService.getUnnotifiedCount();
        setPackageNotificationCount(count);
      } catch (error) {
        console.error("Failed to fetch package notification count:", error);
        setPackageNotificationCount(0);
      }
    };

    // Only fetch if user has permission to view students (required for packages)
    if (user?.permissions?.includes("view_students")) {
      // Fetch on mount and when pathname changes (user navigates)
      fetchNotificationCount();
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchNotificationCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [pathname, user]);

  // Create permission and role checkers
  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) ?? false;
  };

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  // Get and filter nav groups
  const allNavGroups = getNavGroups(t, packageNotificationCount, user?.role);
  const navGroups = allNavGroups
    .map((group) => ({
      ...group,
      items: filterNavItems(group.items, hasPermission, hasRole),
    }))
    .filter((group) => group.items.length > 0); // Remove empty groups

  if (!isMounted) {
    return null;
  }

  return (
    <TooltipProvider>
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 256 : 80,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.5,
        }}
        className={cn(
          "fixed top-0 z-40 h-screen bg-gradient-to-b from-gray-900 via-emerald-950 to-gray-900 flex flex-col",
          "shadow-xl backdrop-blur-md border-r border-gray-700/50",
          "overflow-hidden",
          direction === "rtl"
            ? "right-0 border-l border-gray-700/50"
            : "left-0 border-r border-gray-700/50"
        )}
      >
        {/* Islamic Geometric Pattern Background */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="islamic-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                {/* Central Star */}
                <polygon points="60,10 70,35 95,35 75,50 80,75 60,60 40,75 45,50 25,35 50,35" 
                  fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.6"/>
                {/* Geometric Circles */}
                <circle cx="60" cy="60" r="8" fill="none" stroke="#059669" strokeWidth="0.4" opacity="0.5"/>
                <circle cx="60" cy="60" r="15" fill="none" stroke="#10b981" strokeWidth="0.3" opacity="0.4"/>
                {/* Interlacing Lines */}
                <path d="M 0,60 Q 30,30 60,60 T 120,60" stroke="#10b981" strokeWidth="0.4" fill="none" opacity="0.5"/>
                <path d="M 60,0 Q 30,30 60,60 T 60,120" stroke="#10b981" strokeWidth="0.4" fill="none" opacity="0.5"/>
                <path d="M 0,0 L 120,120 M 120,0 L 0,120" stroke="#059669" strokeWidth="0.3" opacity="0.4"/>
                {/* Additional Geometric Shapes */}
                <rect x="50" y="50" width="20" height="20" fill="none" stroke="#10b981" strokeWidth="0.3" opacity="0.4" transform="rotate(45 60 60)"/>
                <path d="M 30,60 L 90,60 M 60,30 L 60,90" stroke="#059669" strokeWidth="0.3" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
          </svg>
        </div>
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-transparent to-teal-950/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent pointer-events-none" />
        
        {/* Logo Section */}
        <motion.div
          transition={{ duration: 0.2 }}
          className="relative z-10 flex items-center h-20 border-b border-gray-700/50 bg-gradient-to-r from-gray-900 via-emerald-950 to-gray-900"
        >
          {isOpen ? (
            <div className="flex items-center justify-between w-full px-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key="logo-expanded"
                  initial={{ opacity: 0, x: -20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg ring-2 ring-emerald-600/30 bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-900 p-1.5"
                  >
                    <Image 
                      src="/logo.png" 
                      alt="ElmCorner Logo" 
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="font-bold text-lg text-white"
                  >
                    ElmCorner
                  </motion.span>
                </motion.div>
              </AnimatePresence>
              {/* Enhanced Toggle Button - Expanded */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.1,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggle}
                  className={cn(
                    "h-9 w-9 rounded-lg transition-all duration-200",
                    "hover:bg-emerald-600 hover:text-white",
                    "border border-gray-600 hover:border-emerald-500",
                    "shadow-sm hover:shadow-lg hover:shadow-emerald-500/30",
                    "text-gray-300 hover:text-white"
                  )}
                >
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                  >
                    <X className="h-4 w-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              {/* Enhanced Toggle Button - Collapsed (only toggle button visible) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggle}
                  className={cn(
                    "h-9 w-9 rounded-lg transition-all duration-200",
                    "hover:bg-emerald-600 hover:text-white",
                    "border border-gray-600 hover:border-emerald-500",
                    "shadow-sm hover:shadow-lg hover:shadow-emerald-500/30",
                    "text-gray-300 hover:text-white"
                  )}
                >
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                  >
                    <Menu className="h-4 w-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Navigation Items */}
        <motion.nav
          animate={{
            opacity: isOpen ? 1 : 0.8,
          }}
          transition={{
            duration: 0.2,
          }}
          className="relative z-10 flex-1 overflow-y-auto py-4 px-2 scrollbar-thin dark-sidebar"
        >
          <div className="space-y-6">
            {navGroups.map((group, groupIndex) => (
              <motion.div
                key={group.title}
                initial={false}
                animate={{
                  opacity: isOpen ? 1 : 0.7,
                }}
                transition={{
                  delay: groupIndex * 0.05,
                  duration: 0.2,
                }}
              >
                {isOpen ? (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, x: -10, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -10, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      className="px-3 mb-2"
                    >
                      <h3 className="text-xs font-semibold text-emerald-300/70 uppercase tracking-wider">
                        {group.title}
                      </h3>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="h-2" />
                )}
                <ul className="space-y-1">
                  {group.items.map((item, itemIndex) => (
                    <motion.li
                      key={item.href}
                      initial={false}
                      animate={{
                        opacity: isOpen ? 1 : 0.8,
                        x: isOpen ? 0 : -5,
                      }}
                      transition={{
                        delay: (groupIndex * 0.05) + (itemIndex * 0.03),
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    >
                      <NavItemComponent
                        item={item}
                        isOpen={isOpen}
                        pathname={pathname}
                        direction={direction}
                      />
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.nav>

        {/* Footer */}
        <div className="relative z-10 p-4 border-t border-gray-700/50 bg-gradient-to-t from-gray-900/50 to-transparent">
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-emerald-300/60 text-center"
            >
              <p>© 2024 ElmCorner</p>
            </motion.div>
          ) : (
            <div className="h-4" />
          )}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}

