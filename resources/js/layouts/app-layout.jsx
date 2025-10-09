import React, { useEffect } from "react";

import { LoadScript } from "@react-google-maps/api";
import { Toaster, toast } from "sonner";
import { usePage } from "@inertiajs/react";

//custom component
import LogAdmin from "../Components/ui/CustomComponent/LogAdmin";

//layout component
import Header from "./Header";

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
        <div className="max-w-3xl mx-auto p-6 mb-20">

            {/* header */}
            <Header
                page={page} // this props is based on page usePage inertia
            />

            <main className="p-5 mt-5">
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
