import React from "react";
import { Link } from "@inertiajs/react";

const NavigationLinks = ({ href, title, icon: IconProp, Icon: AltIcon, page, onClick }) => {
    const Icon = IconProp || AltIcon;

    let finalHref = href;
    if (title === "Mark Attendance" || title === "Scan QR" || title === "Save Attendance") {
        const savedToken = typeof window !== "undefined" ? localStorage.getItem("attendanceToken") : null;
        if (savedToken) {
            finalHref = `/?token=${savedToken}`;
        }
    }

    const currentPath = page?.url?.split("?")[0] || "";
    const pageActive = currentPath === href || (href === "/" && currentPath === "");

    return (
        <Link
            href={finalHref}
            onClick={onClick}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                pageActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-800"
            }`}
        >
            {Icon && (
                <div className={`p-1 rounded-lg ${pageActive ? "bg-white/15 text-white" : "text-slate-400"}`}>
                    <Icon className="w-5 h-5 shrink-0" />
                </div>
            )}
            <span className="flex-1 truncate">{title}</span>
            {pageActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
        </Link>
    );
};

export default NavigationLinks;