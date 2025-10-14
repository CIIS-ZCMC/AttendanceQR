import {
    Calendar,
    CalendarCog,
    Home,
    Inbox,
    QrCode,
    Search,
    Settings,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";
import {
    BookOpen,
    CircleDollarSign,
    Clock,
    FileChartLine,
    FolderArchive,
    Columns3,
    LayoutGrid,
    SquareDashedKanban,
    UserCog,
    LayoutDashboard,
    Users,
} from "lucide-react";
import logo from "../src/zcmc.jpeg";
import { Link, usePage } from "@inertiajs/react";
// Menu items.
const mainNavItems = [
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

export default function AppSidebar() {
    const page = usePage();
    return (
        <Sidebar collapsible="icon" variant="inset" className={"bg-gray-800 "}>
            <SidebarContent className={"bg-gray-800 h-full"}>
                <SidebarHeader className="flex flex-row items-center gap-1 ">
                    <div className="flex-none ml-[-3px]">
                        <img src={logo} alt="" width="40px" height="40px" />
                    </div>

                    <SidebarGroupLabel className={"text-white text-xl flex-1"}>
                        UMIS-Attendance
                    </SidebarGroupLabel>
                </SidebarHeader>
                <SidebarGroup>
                    <SidebarGroupLabel className={"text-white"}>
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className={"gap-4"}>
                            {mainNavItems.map((item) => {
                                const pageActive =
                                    page.url.split("?")[0] === item.href;

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            className={`text-white ${pageActive
                                                ? " rounded-full border border-blue-100 bg-gray-100"
                                                : ""
                                                }`}
                                        >
                                            <Link href={item.href}>
                                                <item.icon
                                                    className={
                                                        pageActive
                                                            ? "text-blue-900 ml-[-1px] "
                                                            : ""
                                                    }
                                                />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
