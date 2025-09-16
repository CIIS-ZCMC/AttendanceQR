import React from "react";
import { useGeofence } from "@/hooks/use-geofence";
import { useState, useEffect } from "react";
import AppLayout from "@/layouts/app-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotInLocation } from "@/Components/ui/CustomComponent/notinLocation";
import { AttrSkeleton } from "@/Components/ui/CustomComponent/AttrSkeleton";
import { LoaderCircle } from "lucide-react";
import mappin from "../../src/mappin.gif";
import check from "../../src/check.gif";
import { toast } from "sonner";
import FailedScan from "./FailedScan";
import { router } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";

export default function Scan({ invalid_status, attendance }) {
    const [serverTime, setServerTime] = useState(
        new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        })
    );
    const [serverDate, setServerDate] = useState(
        new Date().toLocaleDateString([], {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    );
    const page = usePage();
    const [closeAt, setCloseAt] = useState(new Date());
    const [remainingTime, setRemainingTime] = useState("");
    const [load, setLoad] = useState(true);
    const [isInLocation, setIsInLocation] = useState(false);
    const [isRecorded, setIsRecorded] = useState(false);
    const isInsideGeofence = useGeofence();
    const [btnLoad, setBtnLoad] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCloseAt(new Date(attendance?.closed_at));
            const closeTime = new Date(attendance?.closed_at);
            const now = new Date();
            const diffMs = closeTime - now;

            if (diffMs >= 1) {
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor(
                    (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                );
                const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

                const formattedHours = hours
                    ? `${hours.toString().padStart(2, "0")}h`
                    : "";
                const formattedMinutes = minutes
                    ? `${minutes.toString().padStart(2, "0")}m`
                    : "";
                const formattedSeconds = seconds
                    ? `${seconds.toString().padStart(2, "0")}s`
                    : "";

                const remainingTime = `${
                    formattedHours ? `${formattedHours} : ` : ""
                }${formattedMinutes ? `${formattedMinutes} :` : ""}${
                    formattedSeconds ? `  ${formattedSeconds}` : ""
                }`;
                const isValidTime =
                    formattedHours || formattedMinutes || formattedSeconds;
                setRemainingTime(isValidTime ? remainingTime : "0");
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setServerTime(
                new Date().toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                })
            );
            setServerDate(
                new Date().toLocaleDateString([], {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })
            );
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setIsInLocation(isInsideGeofence);
        setTimeout(() => {
            setLoad(false);
        }, 500);
    }, [isInsideGeofence]);

    useEffect(() => {
        if (isInLocation && attendance && invalid_status === null) {
            toast.success(
                "You are inside the area. Please log your attendance."
            );
        }
    }, [isInLocation]);

    useEffect(() => {
        if (remainingTime === "0") {
            setTimeout(() => {
                router.reload();
            }, 5000);
        }
    }, [remainingTime]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const employeeId = e.target.employeeId.value;
        setBtnLoad(true);
        console.log("Submitted", employeeId);
        setTimeout(() => {
            setIsRecorded(true);
            setBtnLoad(false);
        }, 4000);
    };

    return (
        <AppLayout>
            {attendance && invalid_status === null && (
                <>
                    <h3 className="text-lg font-bold">Mark Attendance</h3>
                    <h6 className="text-xs">
                        Enter Employee ID to record attendance
                    </h6>

                    <span className="text-xs" data-live="server-time">
                        <span
                            className="text-gray-500 text-xs font-bold"
                            data-live-update
                        >
                            {serverTime} | {serverDate}
                        </span>
                    </span>
                    <br />
                    <span className="text-xs" data-live="server-time">
                        Title : <br />{" "}
                        <span className="text-gray-500 text-lg font-bold">
                            {attendance?.title}
                        </span>
                    </span>
                    <br />
                </>
            )}
            <div className="mt-4 flex justify-center items-center md:absolute md:top-80 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2">
                {invalid_status ? (
                    <FailedScan
                        invalid_status={invalid_status}
                        isInLocation={isInLocation}
                    />
                ) : load ? (
                    <AttrSkeleton />
                ) : isRecorded ? (
                    <div>
                        <br />
                        <br />
                        <Alert variant="default" className="border-none">
                            <AlertDescription>
                                <span className="text-md text-green-600  flex items-center">
                                    Attendance recorded successfully{" "}
                                    <img
                                        src={check}
                                        alt=""
                                        width="40px"
                                        height="40px"
                                    />
                                </span>
                            </AlertDescription>
                        </Alert>
                    </div>
                ) : isInLocation ? (
                    <div>
                        <br />
                        <Alert variant="default">
                            <AlertDescription>
                                <span className="text-xs text-blue-600  flex items-center">
                                    Attendance can be logged — you are inside
                                    the allowed area.{" "}
                                    <img
                                        src={mappin}
                                        alt=""
                                        width="40px"
                                        height="40px"
                                    />
                                </span>
                            </AlertDescription>
                        </Alert>
                        <br />
                        <span className="text-sm">
                            Enter employee ID : <br />{" "}
                            <span className="text-gray-500"></span>
                        </span>
                        <form action="" onSubmit={handleSubmit}>
                            <Input
                                type="number"
                                name="employeeId"
                                required
                                placeholder="e.g 2022090251"
                                autoFocus
                                className={"mt-4 mb-3 text-center shadow-lg  "}
                            />
                            <Button type="submit" disabled={btnLoad}>
                                {" "}
                                {btnLoad ? (
                                    <>
                                        <LoaderCircle className="h-4 w-4 animate-spin" />{" "}
                                        Submitting
                                    </>
                                ) : (
                                    "Submit"
                                )}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <NotInLocation />
                )}
            </div>
            {isInLocation && attendance && invalid_status === null && (
                <>
                    <span className="text-xs" data-live="server-time">
                        <div className="text-center mt-2">
                            <span className="text-xs block">Closes at:</span>

                            <div className="mt-1 text-lg text-red-600 font-semibold">
                                {remainingTime}
                            </div>

                            {/* Current live date & time */}
                            <div className="mt-1 text-xs text-gray-400">
                                Closing Time:{" "}
                                <span className="font-medium">
                                    {closeAt.toLocaleDateString([], {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}{" "}
                                    {closeAt.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                    })}
                                </span>
                            </div>
                        </div>
                    </span>
                </>
            )}
        </AppLayout>
    );
}
