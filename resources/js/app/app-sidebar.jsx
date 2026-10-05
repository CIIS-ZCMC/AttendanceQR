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
import { getNavItems } from "@/constants/navBarItems";

export default function AppSidebar({ is_admin } = {}) {
    const page = usePage();
    const isAdmin = Boolean(is_admin ?? page.props?.is_admin);
    const navItems = getNavItems(isAdmin);
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
                            {navItems.map((item) => {
                                let href = item.href;
                                if (item.title === "Mark Attendance" || item.title === "Scan QR" || item.title === "Save Attendance") {
                                    const savedToken = localStorage.getItem("attendanceToken");
                                    if (savedToken) {
                                        href = `/?token=${savedToken}`;
                                    }
                                } else if (item.title === "Location Calibrator" || item.title === "Calibrate" || item.href === "/calibrate") {
                                    const savedToken = localStorage.getItem("attendanceToken");
                                    if (savedToken) {
                                        href = `/calibrate?token=${savedToken}`;
                                    }
                                }
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
                                            <Link href={href}>
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
