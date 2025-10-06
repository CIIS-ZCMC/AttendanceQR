import React, { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import warning from "../../../src/warning.gif";

import { toast } from "sonner";
import { usePage } from "@inertiajs/react";
import { Toaster } from "sonner";
import location from "../../../src/location.png";
export const NotInLocation = ({ locationService }) => {
    const page = usePage();

    return (
        <div className="bg-red-50 p-5 border rounded">
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
                                    "You are outside the allowed area."
                                ) : (
                                    <p className="text-xs text-center text-gray-600">
                                        <span className="font-semibold">
                                            Location access is currently
                                            disabled.
                                        </span>
                                        <br /> <br />
                                        Please enable location services to
                                        continue — this helps us verify your
                                        attendance accurately and provide a
                                        better experience.
                                        <br /> <br />
                                        👉 Go to your device or browser settings
                                        and allow location access for this app,
                                        then try again!
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
