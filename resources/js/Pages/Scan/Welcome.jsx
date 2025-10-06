import { QrCode, MapPin, Smartphone, Globe } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";
import logo from "../../src/zcmc.jpeg";

export default function Welcome() {
    return (
        <div className="max-w-md  mx-auto mt-20 p-6 rounded-2xl shadow-md bg-white text-center space-y-4">
            <div className="flex items-center gap-2 justify-center text-xl font-bold">
                <img src={logo} alt="" className="w-10 h-12" />
                UMIS - Geofencing Attendance
            </div>

            <div className="flex justify-center">
                <MapPin className="w-12 h-12 text-blue-500" />
            </div>

            <h2 className="text-2xl font-semibold">Enable Location Services</h2>
            <p className="text-gray-600 text-sm">
                We need access to your location to verify your attendance
                accurately. Please make sure your location is turned on before
                proceeding.
            </p>

            <div className="border-t pt-4 mt-4 text-left space-y-3">
                <h3 className="font-medium flex items-center gap-2 text-gray-800">
                    <Smartphone className="w-5 h-5 text-green-500" /> For
                    Android:
                </h3>
                <ul className="list-disc pl-6 text-gray-600 text-sm space-y-1">
                    <li>
                        Open <b>Settings</b> → <b>Location</b>
                    </li>
                    <li>
                        Turn on <b>Use location</b>
                    </li>
                    <li>
                        Allow this app or browser to access your location when
                        prompted
                    </li>
                    <li>
                        Try this for Android Users -
                        <a
                            href="intent://#Intent;action=android.settings.LOCATION_SOURCE_SETTINGS;end"
                            className="text-blue-500 underline ml-2"
                        >
                            Open Location Settings
                        </a>
                    </li>
                </ul>

                <h3 className="font-medium flex items-center gap-2 text-gray-800">
                    <Globe className="w-5 h-5 text-blue-500" /> For iOS:
                </h3>
                <ul className="list-disc pl-6 text-gray-600 text-sm space-y-1">
                    <li>
                        Open <b>Settings</b> → <b>Privacy & Security</b> →{" "}
                        <b>Location Services</b>
                    </li>
                    <li>
                        Ensure <b>Location Services</b> is turned on
                    </li>
                    <li>
                        Find your browser (e.g. Safari, Chrome) and set it to{" "}
                        <b>While Using the App</b>
                    </li>
                </ul>
            </div>

            <p className="text-xs text-gray-400 mt-2">
                Having trouble? Refresh the page after enabling location. This
                setup is once only, you won't need to do it again.
            </p>

            <Button
                className="mt-4 w-full"
                onClick={() => {
                    router.visit("/", {
                        preserveScroll: true,
                        preserveState: true,
                    });
                }}
            >
                Proceed to Attendance
            </Button>
        </div>
    );
}
