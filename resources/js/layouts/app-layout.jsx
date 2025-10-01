import React from "react";
import AppSidebar from "../app/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LoadScript } from "@react-google-maps/api";
import { Toaster } from "sonner";
import LogAdmin from "../Components/ui/CustomComponent/LogAdmin";
import { usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function AppLayout({
    children,
    is_admin = false,
    w_admin = false,
}) {
    const page = usePage();
    useEffect(() => {
        if (page.props.error) {
            toast.error(page.props.error);
        }
    }, [page.props.error]);
    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "16rem",
                "--sidebar-width-mobile": "16rem",
                "background-color": "white",
            }}
        >
            <SidebarTrigger className={"ml-2 mt-2 text-2xl"} />
            <AppSidebar />
            <main className="p-10">
                {w_admin ? is_admin ? children : <LogAdmin /> : children}
                <LoadScript
                    googleMapsApiKey="AIzaSyDok3Z6YRFk0Oj1f_bMTuWCDwDMOp6u4Sw"
                    libraries={["geometry"]}
                ></LoadScript>
                <Toaster
                    position="top-center"
                    duration={5000}
                    richColors={true}
                />
            </main>
        </SidebarProvider>
    );
}
