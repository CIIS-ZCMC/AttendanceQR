import React from "react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import warning from "../../src/warning.gif";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";

export default function ActiveConfiguration() {
    return (
        <AppLayout title="Active Configuration">
            <div className="mt-4 flex justify-center items-center md:absolute md:top-80 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2">
                <Card className="w-full max-w-md shadow-md border border-gray-200">
                    <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                        <h2 className="text-sm font-semibold text-gray-800">
                            App Configuration
                        </h2>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
