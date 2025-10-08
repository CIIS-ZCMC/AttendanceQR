import {
    CalendarCog,
    QrCode,
    Settings,
    Clock,
} from "lucide-react";

export const mainNavItems = [
    {
        title: "Scan QR",
        href: "/",
        icon: QrCode,
    },
    {
        title: "My Attendances",
        href: "/my-attendance",
        icon: Clock,
    },
    {
        title: "Active Attendance",
        href: "/active-configuration",
        icon: CalendarCog,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
];