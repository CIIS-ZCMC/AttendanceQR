import {
    CalendarCog,
    UserCheck,
    Settings,
    Clock,
    Crosshair,
} from "lucide-react";

export const baseNavItems = [
    {
        title: "Mark Attendance",
        href: "/",
        icon: UserCheck,
    },
    {
        title: "My Attendances",
        href: "/my-attendance",
        icon: Clock,
    },
    {
        title: "Location Calibrator",
        href: "/calibrate",
        icon: Crosshair,
    },
];

export const adminNavItems = [
    {
        title: "Active Attendance",
        href: "/active-configuration",
        icon: CalendarCog,
    },
    {
        title: "Responses",
        href: "/responses",
        icon: Settings,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

export const getNavItems = (isAdmin = false) => {
    return isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;
};

export const mainNavItems = [...baseNavItems, ...adminNavItems];