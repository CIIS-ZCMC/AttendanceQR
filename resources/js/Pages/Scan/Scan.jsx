import React, { use } from "react";
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
import { router, useForm } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
export default function Scan({ invalid_status, attendance, ip }) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        recentlySuccessful,
    } = useForm({
        employeeId: "",
        attendanceId: attendance?.id,
    });

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
    const [isWithinLocation, setIsWithinLocation] = useState(false);
    const [locationService, setLocationService] = useState(true);
    const [fingerprint, setFingerprint] = useState(null);
    const [anomalyState, setAnomalyState] = useState(false);
    const [distance, setDistance] = useState(null);
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    const loadFingerprint = async () => {
                        const fp = await FingerprintJS.load();
                        const result = await fp.get();
                        setFingerprint(result.visitorId);
                        axios
                            .get(
                                `validate-location?lat=${lat}&lng=${lng}&fingerprint=${result.visitorId}`
                            )
                            .then((response) => {
                                setIsWithinLocation(response.data.isInLocation);
                                setLoad(false);
                                setLocationService(true);
                                setDistance(response.data.distance);
                            })
                            .catch((error) => {
                                console.log(error);
                                toast.error("❌ Unable to fetch location.");
                                setLoad(false);
                                setLocationService(false);
                            });
                    };

                    loadFingerprint();
                },
                () => {
                    alert(
                        "❌ Location access is currently disabled.\n\nPlease enable location services to continue — this helps us verify your attendance accurately and provide a better experience.\n\n👉 Go to your device or browser settings and allow location access for this app, then try again!"
                    );
                    setLocationService(false);
                    setLoad(false);
                },
                {
                    maximumAge: 5000,
                }
            );
        } else {
            toast.error(
                "❌ Geolocation is not supported on this device or browser. Please try using a supported browser or enable location settings to continue."
            );
            setLocationService(false);

            setLoad(false);
        }
    }, []);

    useEffect(() => {
        setData({ attendanceId: attendance?.id });
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
        if (remainingTime === "0") {
            setTimeout(() => {
                router.reload();
            }, 5000);
        }
    }, [remainingTime]);

    const handleSubmit = (e) => {
        e.preventDefault();

        post("/store_attendance", {
            fingerprint: fingerprint,
            onSuccess: (response) => {
                if (response.props?.session?.type == "error") {
                    toast.error(response.props.session.message);
                } else if (response.props?.session?.type == "warning-anomaly") {
                    toast.warning(response.props.session.message);
                    setAnomalyState(true);
                } else {
                    localStorage.setItem("employeeID", data.employeeId);
                    toast.success("Attendance recorded successfully");
                }
            },
        });
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
                        <span className="text-gray-500 text-md font-bold">
                            {attendance?.title}
                        </span>
                    </span>
                </>
            )}

            <div className="mt-4 flex justify-center items-center md:absolute md:top-80 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2">
                {load ? (
                    <AttrSkeleton />
                ) : !isWithinLocation ? (
                    <NotInLocation
                        locationService={locationService}
                        distance={distance}
                    />
                ) : invalid_status ? (
                    <FailedScan
                        invalid_status={invalid_status}
                        isInLocation={isWithinLocation}
                        anomalyState={anomalyState}
                    />
                ) : isWithinLocation ? (
                    <div>
                        <br />

                        <span className="text-xs text-blue-600  flex items-center">
                            Attendance can be logged — you are inside the
                            allowed area.
                            <img
                                src={mappin}
                                alt=""
                                width="40px"
                                height="40px"
                            />
                        </span>
                        <span className="text-sm">
                            Enter employee ID : <br />{" "}
                            <span className="text-gray-500"></span>
                        </span>
                        <form onSubmit={handleSubmit}>
                            <Input
                                type="number"
                                name="employeeId"
                                value={data.employeeId}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        employeeId: e.target.value,
                                    })
                                }
                                required
                                placeholder="e.g 2022090251"
                                autoFocus
                                className={"mt-4 mb-3 text-center shadow-lg  "}
                            />

                            <Button type="submit" disabled={processing}>
                                {" "}
                                {processing ? (
                                    <>
                                        <LoaderCircle className="h-4 w-4 animate-spin" />{" "}
                                        Submitting
                                    </>
                                ) : (
                                    "Submit"
                                )}
                            </Button>
                        </form>
                        <br />

                        {isWithinLocation &&
                            attendance &&
                            invalid_status === null && (
                                <>
                                    <span
                                        className="text-xs"
                                        data-live="server-time"
                                    >
                                        <div className="text-center mt-2">
                                            <span className="text-xs block">
                                                Closes at:
                                            </span>

                                            <div className="mt-1 text-lg text-red-600 font-semibold">
                                                {remainingTime}
                                            </div>

                                            {/* Current live date & time */}
                                            <div className="mt-1 text-xs text-gray-400">
                                                Closing Time:{" "}
                                                <span className="font-medium">
                                                    {closeAt.toLocaleDateString(
                                                        [],
                                                        {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        }
                                                    )}{" "}
                                                    {closeAt.toLocaleTimeString(
                                                        [],
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            second: "2-digit",
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </span>
                                </>
                            )}
                    </div>
                ) : (
                    <NotInLocation
                        locationService={locationService}
                        distance={distance}
                    />
                )}
            </div>
        </AppLayout>
    );
}
