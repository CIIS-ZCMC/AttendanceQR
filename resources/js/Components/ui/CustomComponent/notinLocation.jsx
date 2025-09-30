import React, { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import warning from "../../../src/warning.gif";

import { toast } from "sonner";
import { usePage } from "@inertiajs/react";
import { Toaster } from "sonner";
export const NotInLocation = () => {
    const page = usePage();

    return (
        <div className="bg-red-100 p-5 border rounded">
            <div>
                <div className="">
                    <br />
                    <Alert variant="destructive">
                        <AlertTitle className="flex flex-col items-center gap-2">
                            <img
                                src={warning}
                                alt="Warning"
                                className="w-10 h-10 "
                            />{" "}
                            <span className="text-md">
                                Unable to log attendance
                            </span>
                        </AlertTitle>
                        <AlertDescription className="flex justify-center">
                            <span className="text-xs text-center text-red-600">
                                You are outside the allowed area.
                            </span>
                        </AlertDescription>
                    </Alert>

                    <p className="text-sm mt-2 p-3">
                        Kindly move to the allowed area and click{" "}
                        <span className="font-semibold">Try Again</span>.
                    </p>
                </div>
                <br />
                <Link href={page.url}>
                    <Button type="button" className="w-full">
                        Try again
                    </Button>
                </Link>
            </div>
            <Toaster position="top-right" richColors />
        </div>
    );
};
