import React from "react";
import { Link } from "@inertiajs/react";
import {
    UserCheck,
    Clock,
    Crosshair,
    Settings,
    ClipboardList,
} from "lucide-react";

export default function BottomNavigation({ page, is_admin }) {
    const currentPath = page?.url?.split("?")[0] || "";
    const isAdmin = Boolean(is_admin ?? page?.props?.is_admin);

    const savedToken =
        typeof window !== "undefined"
            ? localStorage.getItem("attendanceToken")
            : null;
    const scanHref = savedToken ? `/?token=${savedToken}` : "/";
    const calibrateHref = savedToken ? `/calibrate?token=${savedToken}` : "/calibrate";
    const isScanActive = currentPath === "/" || currentPath === "";

    // Items on the left side of Mark Attendance
    const leftItems = [
        {
            title: "My Logs",
            href: "/my-attendance",
            icon: Clock,
            isActive: currentPath.startsWith("/my-attendance"),
        },
        ...(isAdmin
            ? [
                  {
                      title: "Calibrate",
                      href: calibrateHref,
                      icon: Crosshair,
                      isActive: currentPath.startsWith("/calibrate"),
                  },
              ]
            : []),
    ];

    // Items on the right side of Mark Attendance
    const rightItems = isAdmin
        ? [
              {
                  title: "Responses",
                  href: "/responses",
                  icon: ClipboardList,
                  isActive: currentPath.startsWith("/responses"),
              },
              {
                  title: "Settings",
                  href: "/settings",
                  icon: Settings,
                  isActive:
                      currentPath.startsWith("/settings") ||
                      currentPath.startsWith("/active-configuration"),
              },
          ]
        : [
              {
                  title: "Calibrate",
                  href: calibrateHref,
                  icon: Crosshair,
                  isActive: currentPath.startsWith("/calibrate"),
              },
          ];

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
            <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-between relative">
                {/* Left side items */}
                <div className="flex-1 flex items-center justify-around">
                    {leftItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-90 duration-150 min-w-[56px] ${
                                    item.isActive
                                        ? "text-blue-600 dark:text-blue-400 font-bold"
                                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
                                }`}
                            >
                                <div className="relative flex items-center justify-center">
                                    <Icon
                                        className={`w-5 h-5 transition-transform duration-200 ${
                                            item.isActive ? "scale-110 stroke-[2.3]" : "stroke-[1.8]"
                                        }`}
                                    />
                                    {item.isActive && (
                                        <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                                    )}
                                </div>
                                <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
                                    {item.title}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Center Mark Attendance Hero Button */}
                <div className="shrink-0 px-2 flex justify-center">
                    <Link
                        href={scanHref}
                        className="relative -top-3.5 flex flex-col items-center group focus:outline-none"
                    >
                        <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 duration-200 ${
                                isScanActive
                                    ? "bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white shadow-blue-500/40 ring-4 ring-white dark:ring-slate-900"
                                    : "bg-slate-900 dark:bg-slate-800 text-white shadow-slate-900/30 ring-4 ring-white dark:ring-slate-900 hover:bg-slate-800"
                            }`}
                        >
                            <UserCheck className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <span
                            className={`text-[10px] font-bold mt-0.5 tracking-tight transition-colors whitespace-nowrap text-center ${
                                isScanActive
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-slate-600 dark:text-slate-400"
                            }`}
                        >
                            Mark Attendance
                        </span>
                    </Link>
                </div>

                {/* Right side items */}
                <div className="flex-1 flex items-center justify-around">
                    {rightItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-90 duration-150 min-w-[56px] ${
                                    item.isActive
                                        ? "text-blue-600 dark:text-blue-400 font-bold"
                                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
                                }`}
                            >
                                <div className="relative flex items-center justify-center">
                                    <Icon
                                        className={`w-5 h-5 transition-transform duration-200 ${
                                            item.isActive ? "scale-110 stroke-[2.3]" : "stroke-[1.8]"
                                        }`}
                                    />
                                    {item.isActive && (
                                        <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                                    )}
                                </div>
                                <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
                                    {item.title}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
