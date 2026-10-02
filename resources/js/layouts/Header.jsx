import React, { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Menu, X, ShieldCheck, MapPin, Building2, HelpCircle } from "lucide-react";

import {
    Drawer,
    DrawerTrigger,
    DrawerTitle,
    DrawerContent,
    DrawerHeader,
    DrawerClose,
} from "@/components/ui/drawer";

// layout components
import NavigationLinks from "./NavigationLinks";

// assets & constants
import { baseNavItems, adminNavItems } from "@/constants/navBarItems";
import logo from "../src/zcmc.jpeg";
import { drawerContants } from "@/constants/contants";

const Header = ({ page, is_admin }) => {
    const [open, setOpen] = useState(false);
    const { sidebarHeader, header } = drawerContants;
    const isAdmin = Boolean(is_admin ?? page?.props?.is_admin);

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/95 text-white backdrop-blur-md border-b border-slate-800/80 shadow-sm z-50 px-3 sm:px-5 flex items-center justify-between transition-all">
            {/* Left: Drawer Trigger & Branding */}
            <div className="flex items-center gap-2.5">
                <Drawer direction="left" open={open} onOpenChange={setOpen}>
                    <DrawerTrigger asChild>
                        <button
                            aria-label="Open Navigation Menu"
                            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all focus:outline-none"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </DrawerTrigger>

                    <DrawerContent className="bg-slate-900 text-white border-r border-slate-800 p-0 max-w-[300px] w-[85vw] h-full flex flex-col">
                        <DrawerHeader className="p-5 border-b border-slate-800 text-left">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <img
                                        src={logo}
                                        alt="ZCMC Crest"
                                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/30 shadow-md"
                                    />
                                    <div>
                                        <h3 className="text-sm font-bold text-white tracking-tight">ZCMC</h3>
                                        <span className="text-[10px] font-medium text-blue-400 uppercase tracking-wider block">
                                            UMIS Portal
                                        </span>
                                    </div>
                                </div>

                                <DrawerClose asChild>
                                    <button
                                        aria-label="Close Navigation"
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </DrawerClose>
                            </div>

                            <DrawerTitle className="text-xs text-slate-400 font-normal">
                                Medical Center Attendance & Location System
                            </DrawerTitle>
                        </DrawerHeader>

                        {/* Navigation Links */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">
                                Menu
                            </div>
                            <nav className="space-y-1">
                                {baseNavItems.map(({ title, href, icon }) => (
                                    <NavigationLinks
                                        key={title}
                                        title={title}
                                        href={href}
                                        icon={icon}
                                        page={page}
                                        onClick={() => setOpen(false)}
                                    />
                                ))}
                            </nav>

                            {isAdmin && (
                                <>
                                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-3 pb-1">
                                        Administration
                                    </div>
                                    <nav className="space-y-1">
                                        {adminNavItems.map(({ title, href, icon }) => (
                                            <NavigationLinks
                                                key={title}
                                                title={title}
                                                href={href}
                                                icon={icon}
                                                page={page}
                                                onClick={() => setOpen(false)}
                                            />
                                        ))}
                                    </nav>
                                </>
                            )}
                        </div>

                        {/* Footer Info in Drawer */}
                        <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                                <span>IMISS Office • Tower 1 GF</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                                <span>Attendance QR v2.0</span>
                                <span className="inline-flex items-center gap-1 text-emerald-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live GPS
                                </span>
                            </div>
                        </div>
                    </DrawerContent>
                </Drawer>

                {/* Logo & Application Title */}
                <div className="flex items-center gap-2.5">
                    <img
                        src={logo}
                        alt="ZCMC Logo"
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/20 shadow-xs"
                    />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold tracking-tight text-white leading-tight">
                            ZCMC Attendance
                        </span>
                        <span className="text-[10px] text-slate-400 leading-tight">
                            UMIS Mobile System
                        </span>
                    </div>
                </div>
            </div>

            {/* Right: Live Status Badge */}
            <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="hidden xs:inline">Online</span>
                </div>
            </div>
        </header>
    );
};

export default Header;