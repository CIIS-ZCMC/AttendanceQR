import React, { useState, useEffect } from "react";

import { Button } from "@/Components/ui/button";
import {
    Drawer,
    DrawerTrigger,
    DrawerTitle,
    DrawerContent,
    DrawerHeader,
    DrawerClose,
} from "@/components/ui/drawer";

import { LoadScript } from "@react-google-maps/api";
import { Toaster, toast } from "sonner";
import { Menu, X } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";

import LogAdmin from "../Components/ui/CustomComponent/LogAdmin";

// assets
import { mainNavItems } from "@/constants/navBarItems";
import logo from "../src/zcmc.jpeg";

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

        <div className="max-w-3xl mx-auto p-6">

            <main className="p-5" >
                <Drawer direction="left">
                    {/* Trigger to open drawer */}
                    <DrawerTrigger>
                        <Button variant="outline">
                            <Menu className={"text-2xl"} />
                        </Button>
                    </DrawerTrigger>

                    <DrawerContent className="bg-gray-800">
                        <DrawerHeader>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex-none ml-[-3px]">
                                    <img src={logo} alt="" width="40px" height="40px" />
                                </div>

                                <DrawerClose>
                                    <Button className={"text-white"}>
                                        <X />
                                    </Button>
                                </DrawerClose>
                            </div>

                            <DrawerTitle
                                className={"my-3 text-white text-xl flex-1"}
                            >
                                UMIS-Attendance Application
                            </DrawerTitle>
                            {/* <DrawerDescription>This action cannot be undone.</DrawerDescription> */}
                        </DrawerHeader>

                        {/* sidebar navigation */}
                        <nav className=" flex flex-col space-y-2">
                            {mainNavItems.map(({ title, href, icon: Icon }) => {
                                const pageActive = page.url.split("?")[0] === href;
                                return (
                                    <Link
                                        href={href}
                                    >
                                        <div
                                            className={`ml-2 p-2 flex items-center space-x-3  ${pageActive ? "text-white" : "text-gray-500"}`}>
                                            {Icon && <Icon className="w-5 h-5" />}
                                            <span>{title}</span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </nav>

                    </DrawerContent>
                </Drawer>

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

        </div>
    );
}
