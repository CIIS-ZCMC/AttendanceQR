import React, { useEffect } from "react";
import { Toaster, toast } from "sonner";
import { usePage } from "@inertiajs/react";

// custom component
import LogAdmin from "../Components/ui/CustomComponent/LogAdmin";
import useGoogleMaps from "../hooks/use-google-maps";

// layout components
import Header from "./Header";
import BottomNavigation from "./BottomNavigation";

export default function AppLayout({
    children,
    is_admin = false,
    w_admin = false,
    hideBottomNav = false,
}) {
    const page = usePage();

    // Start loading Google Maps app-wide (used by geofence checks, maps, etc.).
    useGoogleMaps();

    const isAdmin = Boolean(is_admin || page.props?.is_admin);

    useEffect(() => {
        if (page.props.error) {
            toast.error(page.props.error);
        }
    }, [page.props.error]);

    return (
        <div className="min-h-[100dvh] flex flex-col bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
            {/* Top Fixed Mobile Header */}
            <Header page={page} is_admin={isAdmin} />

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-xl mx-auto px-3.5 sm:px-5 pt-20 pb-28 flex flex-col transition-all">
                {w_admin ? (isAdmin ? children : <LogAdmin />) : children}

                <Toaster
                    position="top-center"
                    duration={4000}
                    richColors={true}
                    offset={72}
                    toastOptions={{
                        className: "rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 text-sm",
                    }}
                />
            </main>

            {/* Bottom Mobile Navigation Bar */}
            {!hideBottomNav && (
                <BottomNavigation page={page} is_admin={isAdmin} />
            )}
        </div>
    );
}
