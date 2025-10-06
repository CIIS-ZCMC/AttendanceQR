import React, { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import warning from "../../../src/warning.gif";

import { toast } from "sonner";
import { usePage } from "@inertiajs/react";
import { Toaster } from "sonner";
import location from "../../../src/location.png";
import { Smartphone, Globe } from "lucide-react";

export const NotInLocation = ({ locationService, distance }) => {
    const page = usePage();

    return (
        <div className="bg-red-50 p-5 lg:mt-120 md:mt-130 border rounded">
            <div>
                <div className="">
                    <br />
                    <Alert variant="destructive">
                        <AlertTitle className="flex flex-col items-center gap-2">
                            <span className="text-xs text-gray-500">
                                Attendance allowed area
                            </span>
                            <img
                                src={location}
                                alt="Warning"
                                className="w-70 h-70 "
                            />{" "}
                            <img
                                src={warning}
                                alt="Warning"
                                className="w-10 h-10 "
                            />
                            <span className="text-md">
                                Unable to log attendance
                            </span>
                        </AlertTitle>
                        <AlertDescription className="flex justify-center">
                            <span className="text-xs text-center text-red-600">
                                {locationService ? (
                                    <>
                                        You are outside the allowed area.
                                        <br /> <br />
                                        <span className="font-semibold text-gray-600 text-xs">
                                            Approximately{" "}
                                            <span className="font-bold text-red-600 text-lg">
                                                {distance?.toFixed(2)}
                                            </span>{" "}
                                            meters away from the allowed area.
                                        </span>
                                    </>
                                ) : (
                                    <p className="text-xs text-center text-gray-600">
                                        <span className="font-semibold text-lg">
                                            Location access is currently
                                            disabled.
                                        </span>
                                        <br />
                                        <div className="flex justify-center max-h-[50vh] overflow-y-auto">
                                            <div className="border-t p-3 pt-4 mt-4 text-left space-y-3">
                                                <span className="font-semibold text-sm">
                                                    To enable location access,
                                                    follow these steps:
                                                </span>
                                                <h3 className="font-medium flex items-center gap-2 text-gray-800">
                                                    <Smartphone className="w-5 h-5 text-green-500" />{" "}
                                                    For Android:
                                                </h3>
                                                <ul className="list-disc pl-6 text-gray-600 text-sm space-y-1">
                                                    <li>
                                                        Open <b>Settings</b> →{" "}
                                                        <b>Location</b>
                                                    </li>
                                                    <li>
                                                        Turn on{" "}
                                                        <b>Use location</b>
                                                    </li>
                                                    <li>
                                                        Allow this app or
                                                        browser to access your
                                                        location when prompted
                                                    </li>
                                                </ul>

                                                <h3 className="font-medium flex items-center gap-2 text-gray-800">
                                                    <Globe className="w-5 h-5 text-blue-500" />{" "}
                                                    For iOS:
                                                </h3>
                                                <ul className="list-disc pl-6 text-gray-600 text-sm space-y-1">
                                                    <li>
                                                        Open <b>Settings</b> →{" "}
                                                        <b>
                                                            Privacy & Security
                                                        </b>{" "}
                                                        →{" "}
                                                        <b>Location Services</b>
                                                    </li>
                                                    <li>
                                                        Ensure{" "}
                                                        <b>Location Services</b>{" "}
                                                        is turned on
                                                    </li>
                                                    <li>
                                                        Find your browser (e.g.
                                                        Safari, Chrome) and set
                                                        it to{" "}
                                                        <b>
                                                            While Using the App
                                                        </b>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </p>
                                )}
                            </span>
                        </AlertDescription>
                    </Alert>

                    {locationService && (
                        <p className="text-sm mt-2 p-3">
                            Kindly move to the allowed area and click{" "}
                            <span className="font-semibold">Try Again</span>.
                        </p>
                    )}
                </div>
                <br />
                <Link href={"/"}>
                    <Button type="button" className="w-full">
                        Try again
                    </Button>
                </Link>
            </div>
            <Toaster position="top-right" richColors />
        </div>
    );
};
