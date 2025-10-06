import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import warning from "../../src/warning.gif";
import { Lock } from "lucide-react";
import { router, usePage, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { NotInLocation } from "@/Components/ui/CustomComponent/notinLocation";
import { Toaster } from "@/Components/ui/sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import check from "../../src/check.gif";

export default function FailedScan({ invalid_status, anomalyState }) {
    const page = usePage();

    const Display = () => {
        if (anomalyState) {
            return (
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Card className="w-full max-w-md shadow-md border border-gray-200">
                        <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                            <img
                                src={warning}
                                alt=""
                                width="60px"
                                height="60px"
                            />
                            <h2 className="text-md font-semibold text-red-400">
                                Registering for other employee is highly
                                prohibited.
                            </h2>
                            <p className="text-sm text-gray-500 text-center">
                                This action is recorded — do it again and this
                                ID of yours will be reported to HR.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            );
        } else if (invalid_status.notFound) {
            return (
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Card className="w-full max-w-md shadow-md border border-gray-200">
                        <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                            <h2 className="text-md font-semibold text-gray-800">
                                No Attendance Found
                            </h2>
                            <p className="text-xs text-gray-500 text-center">
                                It looks like no attendance records are
                                available for this link.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            );
        } else if (invalid_status.isNotOpen) {
            return (
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Card className="w-full max-w-md shadow-md border border-gray-200">
                        <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                            <img
                                src={warning}
                                alt=""
                                width="60px"
                                height="60px"
                            />
                            <h2 className="text-sm font-semibold text-gray-800">
                                Attendance is not yet open
                            </h2>
                            <p className="text-xs text-gray-500 text-center">
                                Attendance logging is not yet open. Please check
                                back later or contact your administrator.
                            </p>
                            <br />
                            <Link href={page.url}>
                                <Button type="button" size="sm">
                                    Check Attendance
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            );
        } else if (invalid_status.isClosed) {
            return (
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Card className="w-full max-w-md shadow-md border border-gray-200">
                        <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                            <Lock className="w-10 h-10 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-800">
                                Attendance is Closed
                            </h2>
                            <p className="text-sm text-gray-500 text-center">
                                Attendance logging is no longer available at
                                this time. Please try again during the allowed
                                schedule.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            );
        } else if (invalid_status.isRecorded) {
            return (
                <div>
                    <div className="flex items-center justify-center min-h-[50vh]">
                        <Card className="w-full max-w-md ">
                            <CardContent className="flex flex-col items-center justify-center p-4 space-y-3">
                                <img
                                    src={check}
                                    alt=""
                                    width="40px"
                                    height="40px"
                                />
                                <h2 className="text-md font-semibold text-gray-800">
                                    Attendance is Recorded
                                </h2>
                                <p className="text-sm text-gray-500 text-center">
                                    You have already submitted your attendance
                                    for this time. Please try again during the
                                    allowed schedule.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            );
        }
    };

    return Display();
}
