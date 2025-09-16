import React from "react";
import AppSidebar from "../app/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LoadScript } from "@react-google-maps/api";
import { Toaster } from "sonner";
export default function AppLayout({ children }) {
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
                {children}
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
