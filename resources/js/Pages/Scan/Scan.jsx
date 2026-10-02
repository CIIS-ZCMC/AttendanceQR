import React, { useState, useEffect, useRef } from "react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotInLocation } from "@/Components/ui/CustomComponent/notinLocation";
import { AttrSkeleton } from "@/Components/ui/CustomComponent/AttrSkeleton";
import {
    LoaderCircle,
    CheckCircle2,
    Clock,
    MapPin,
    IdCard,
    ShieldCheck,
    UserCheck,
    Calendar,
    X,
    Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import FailedScan from "./FailedScan";
import { router, useForm, usePage } from "@inertiajs/react";
import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import NoEmployeeID from "./NoEmployeeID";
import Summary from "./Summary";
import AdvisoryModal from "./AdvisoryModal";

export default function Scan({
    invalid_status,
    attendance,
    ip,
    employeeID,
    email,
    profilePhoto,
    UserName,
    isRecorded,
    googleName,
    reload,
    warningSession,
    activeMapLocation,
    mapToken,
}) {
    const [anomaly, setAnomaly] = useState(null);
    const [warning, setWarning] = useState(warningSession);
    const emailWarningShown = useRef(false);

    const storedEmployeeId =
        typeof window !== "undefined"
            ? localStorage.getItem("userEnteredEmployeeId")
            : "";
    const storedEmployeeEmail =
        typeof window !== "undefined"
            ? localStorage.getItem("userEnteredEmployeeEmail")
            : "";
    const userEnteredEmployeeId =
        storedEmployeeEmail && storedEmployeeEmail === email
            ? storedEmployeeId
            : "";

    const resolvedMapToken = mapToken || activeMapLocation?.token;

    const { data, setData, post, processing, errors, reset } = useForm({
        employeeId: userEnteredEmployeeId || "",
        attendanceId: attendance?.id,
        name: null,
        area: null,
        is_no_employee_id: false,
        anomaly: anomaly,
        mapToken: resolvedMapToken,
    });

    const [serverTime, setServerTime] = useState(
        new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        })
    );
    const [serverDate, setServerDate] = useState(
        new Date().toLocaleDateString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
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
    const [userCoords, setUserCoords] = useState(null);
    const [edited, setEdited] = useState(false);
    const [showSummary, setShowSummary] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [noEmployeeID, setNoEmployeeID] = useState(false);

    useEffect(() => {
        if (mapToken) {
            localStorage.setItem("attendanceToken", mapToken);
        } else {
            localStorage.removeItem("attendanceToken");
        }
    }, [mapToken]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Good morning";
        if (hour >= 12 && hour < 17) return "Good afternoon";
        return "Good evening";
    };

    useEffect(() => {
        const hasStatusError =
            invalid_status &&
            (invalid_status.notFound ||
                invalid_status.isNotOpen ||
                invalid_status.isClosed);
        if (hasStatusError) {
            setLoad(false);
            return;
        }
        if (attendance?.no_location) {
            setIsWithinLocation(true);
            setLoad(false);
            return;
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    const posAccuracy = pos.coords.accuracy;
                    setUserCoords({ lat, lng });

                    const loadFingerprint = async () => {
                        try {
                            const fp = await FingerprintJS.load();
                            const result = await fp.get();
                            setFingerprint(result.visitorId);

                            const response = await axios.get(
                                `validate-location?lat=${lat}&lng=${lng}&fingerprint=${
                                    result.visitorId
                                }&accuracy=${posAccuracy}${
                                    resolvedMapToken ? `&token=${resolvedMapToken}` : ""
                                }`
                            );

                            const isSuspicious = response.data.isSuspicious;
                            if (isSuspicious) {
                                setAnomaly(true);
                            }

                            setIsWithinLocation(response.data.isInLocation);
                            setLoad(false);
                            setLocationService(true);
                            setDistance(response.data.distance);

                            if (response.data.saved_direct && !reload) {
                                router.post(
                                    "get-summary",
                                    {
                                        employeeId: employeeID,
                                        mapToken: resolvedMapToken,
                                    },
                                    {
                                        onSuccess: (res) => {
                                            if (res.props?.session?.type === "error") {
                                                toast.error(res.props.session.message);
                                            } else if (res.props?.session?.type === "success") {
                                                setShowSummary(res.props.session.data);
                                            }
                                        },
                                    }
                                );
                            }
                        } catch (error) {
                            console.error(error);
                            toast.error("Unable to validate location accurately.");
                            setLoad(false);
                        }
                    };

                    loadFingerprint();
                },
                () => {
                    toast.error(
                        "Location access is disabled. Please allow location permissions in device settings."
                    );
                    setLocationService(false);
                    setLoad(false);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 5000,
                    timeout: 10000,
                }
            );
        } else {
            toast.error("Geolocation is not supported on this browser.");
            setLocationService(false);
            setLoad(false);
        }
    }, []);

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            attendanceId: attendance?.id,
            anomaly: anomaly,
        }));

        const interval = setInterval(() => {
            const closingDateStr = attendance?.closing_date;
            const closingTimeStr = activeMapLocation?.closing_time;
            if (!closingDateStr) {
                setRemainingTime("0");
                return;
            }
            const closeTime = closingTimeStr
                ? new Date(`${closingDateStr}T${closingTimeStr}`)
                : new Date(`${closingDateStr}T23:59:59`);
            setCloseAt(closeTime);
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
                const formattedSeconds = `${seconds.toString().padStart(2, "0")}s`;

                const timeParts = [formattedHours, formattedMinutes, formattedSeconds]
                    .filter(Boolean)
                    .join(" : ");
                setRemainingTime(timeParts || "0");
            } else {
                setRemainingTime("0");
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [attendance, activeMapLocation, anomaly]);

    useEffect(() => {
        if (employeeID) {
            localStorage.setItem("userEnteredEmployeeId", employeeID);
            localStorage.setItem("userEnteredEmployeeEmail", email || "");
            setData((prev) => ({
                ...prev,
                employeeId: employeeID,
                anomaly: anomaly,
                mapToken: resolvedMapToken,
            }));

            if (isWithinLocation && !isRecorded && !showSummary) {
                const timer = setTimeout(() => {
                    setVerifying(true);
                    router.post(
                        "get-summary",
                        {
                            employeeId: employeeID,
                            attendanceId: attendance?.id,
                            mapToken: resolvedMapToken,
                            anomaly: anomaly,
                        },
                        {
                            preserveState: true,
                            preserveScroll: true,
                            onSuccess: (p) => {
                                setVerifying(false);
                                if (p.props?.session?.type === "error") {
                                    toast.error(p.props.session.message);
                                } else if (p.props?.session?.type === "success") {
                                    setShowSummary(p.props.session.data);
                                }
                            },
                            onError: () => {
                                setVerifying(false);
                                toast.error("Unable to verify employee ID. Please try again.");
                            },
                        }
                    );
                }, 500);

                return () => clearTimeout(timer);
            }
        } else if (!employeeID && !isRecorded) {
            if (!emailWarningShown.current) {
                emailWarningShown.current = true;
                toast.warning("Enter your employee ID to confirm your attendance.");
            }
            setEdited(true);
        }
    }, [employeeID, page.url, isWithinLocation]);

    useEffect(() => {
        const interval = setInterval(() => {
            setServerTime(
                new Date().toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                })
            );
            setServerDate(
                new Date().toLocaleDateString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                })
            );
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (remainingTime === "0") {
            const timeout = setTimeout(() => {
                router.reload();
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [remainingTime]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setEdited(true);
        setShowSummary(null);

        const enteredId = data.employeeId?.toString().trim();
        if (!enteredId) {
            toast.error("Please enter your employee ID");
            return;
        }

        setVerifying(true);

        router.post(
            "get-summary",
            {
                employeeId: enteredId,
                attendanceId: attendance?.id,
                mapToken: resolvedMapToken,
                anomaly: anomaly,
                name: data.name,
                area: data.area,
                is_no_employee_id: data.is_no_employee_id,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (p) => {
                    if (p.props?.session?.type === "error") {
                        toast.error(p.props.session.message);
                    } else if (p.props?.session?.type === "success") {
                        setShowSummary(p.props.session.data);
                    }
                },
                onError: () => {
                    toast.error("Unable to verify employee ID. Please try again.");
                },
                onFinish: () => {
                    setEdited(true);
                    setVerifying(false);
                },
            }
        );
    };

    const handleSubmitAttendance = () => {
        router.post(
            "/store_attendance",
            {
                employeeId: showSummary?.employee_id ?? data.employeeId,
                attendanceId: attendance?.id,
                mapToken: resolvedMapToken,
                anomaly: anomaly,
                fingerprint: fingerprint,
            },
            {
                onSuccess: (response) => {
                    if (response.props?.session?.type === "error") {
                        toast.error(response.props.session.message);
                    } else if (response.props?.session?.type === "warning-anomaly") {
                        toast.warning(response.props.session.message);
                        setAnomalyState(true);
                    } else {
                        localStorage.removeItem("userEnteredEmployeeId");
                        localStorage.removeItem("userEnteredEmployeeEmail");
                        toast.success("Attendance recorded successfully!");
                    }
                },
            }
        );
    };

    const handleSaveNoEmployeeID = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name")?.toString().trim();
        const area = formData.get("area")?.toString().trim();

        if (!name || !area) {
            toast.error("Please fill in all required fields");
            return;
        }

        router.post(
            "/store_attendance",
            {
                name: name,
                area: area,
                is_no_employee_id: true,
                attendanceId: attendance?.id,
                mapToken: resolvedMapToken,
                fingerprint: fingerprint,
            },
            {
                onSuccess: (response) => {
                    if (response.props?.session?.type === "error") {
                        toast.error(response.props.session.message);
                    } else if (response.props?.session?.type === "warning-anomaly") {
                        toast.warning(response.props.session.message);
                        setAnomalyState(true);
                    } else {
                        localStorage.removeItem("userEnteredEmployeeId");
                        localStorage.removeItem("userEnteredEmployeeEmail");
                        toast.success("Attendance recorded successfully!");
                    }
                },
            }
        );

        setNoEmployeeID(false);
    };

    return (
        <AppLayout>
            <AdvisoryModal open={warning} setOpen={setWarning} />

            <div className="w-full max-w-sm sm:max-w-md mx-auto space-y-4 transition-all">
                {load ? (
                    <AttrSkeleton />
                ) : invalid_status ? (
                    <FailedScan
                        invalid_status={invalid_status}
                        isInLocation={isWithinLocation}
                        anomalyState={anomalyState}
                        activeMapLocation={activeMapLocation}
                    />
                ) : !isWithinLocation ? (
                    <NotInLocation
                        locationService={locationService}
                        distance={distance}
                        activeMapLocation={activeMapLocation}
                        userCoords={userCoords}
                    />
                ) : isWithinLocation ? (
                    <div className="space-y-4">
                        {noEmployeeID ? (
                            <NoEmployeeID
                                googleName={googleName}
                                setData={setData}
                                data={data}
                                setNoEmployeeID={setNoEmployeeID}
                                handleSaveNoEmployeeID={handleSaveNoEmployeeID}
                            />
                        ) : showSummary ? (
                            <Summary
                                anomaly={anomaly}
                                employeeID={employeeID}
                                processing={processing}
                                data={data}
                                setData={setData}
                                handleSubmitAttendance={handleSubmitAttendance}
                                showSummary={showSummary}
                                setShowSummary={setShowSummary}
                            />
                        ) : (
                            /* Main Scan Card */
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {/* Digital Clock & Greeting Hero Card */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

                                    <div className="flex items-center justify-between mb-3">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span>
                                                {attendance?.no_location
                                                    ? "Free Location Entry"
                                                    : "Geofence Verified"}
                                            </span>
                                        </div>

                                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                            {serverDate}
                                        </span>
                                    </div>

                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                            {getGreeting()}
                                            {UserName || googleName ? (
                                                <span className="text-blue-600 dark:text-blue-400">
                                                    , {UserName || googleName}
                                                </span>
                                            ) : (
                                                "!"
                                            )}
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Ready to register your official attendance log
                                        </p>
                                    </div>

                                    {/* Live Clock Display */}
                                    <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            <span className="font-mono text-base font-bold tracking-tight">
                                                {serverTime}
                                            </span>
                                        </div>

                                        {activeMapLocation?.location && (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium max-w-[180px] truncate">
                                                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                                <span className="truncate">
                                                    {activeMapLocation.location}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Form Entry Card */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                            <IdCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                Employee Identification
                                            </h3>
                                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                                                Enter your official hospital ID number
                                            </span>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    name="employeeId"
                                                    value={data.employeeId || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, "");
                                                        localStorage.setItem("userEnteredEmployeeId", val);
                                                        localStorage.setItem(
                                                            "userEnteredEmployeeEmail",
                                                            email || ""
                                                        );
                                                        setData((prev) => ({
                                                            ...prev,
                                                            employeeId: val,
                                                            name: null,
                                                            area: null,
                                                            is_no_employee_id: false,
                                                        }));
                                                        setEdited(true);
                                                    }}
                                                    required
                                                    autoFocus
                                                    placeholder="e.g. 2022090251"
                                                    className={`h-14 text-center text-xl font-mono font-bold tracking-wider rounded-2xl border-2 transition-all ${
                                                        employeeID
                                                            ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200"
                                                            : "border-slate-200 dark:border-slate-700 focus:border-blue-500 bg-slate-50/50 dark:bg-slate-800/50"
                                                    }`}
                                                />

                                                {data.employeeId && (
                                                    <button
                                                        type="button"
                                                        aria-label="Clear Employee ID"
                                                        onClick={() => {
                                                            setData("employeeId", "");
                                                            setEdited(true);
                                                        }}
                                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-400 hover:text-slate-600 bg-slate-200/60 dark:bg-slate-700"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {employeeID && (
                                                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                    <span>Auto-detected from Google account</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Full-width Thumb-Friendly Confirm Button */}
                                        <Button
                                            type="submit"
                                            disabled={verifying || !data.employeeId}
                                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {verifying ? (
                                                <>
                                                    <LoaderCircle className="h-5 w-5 animate-spin" />
                                                    <span>Verifying Record...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Verify & Proceed</span>
                                                </>
                                            )}
                                        </Button>
                                    </form>

                                    {/* Registration Link for New Users */}
                                    {!employeeID && (
                                        <div className="pt-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNoEmployeeID(true);
                                                    setData({
                                                        ...data,
                                                        employeeId: null,
                                                        area: null,
                                                        is_no_employee_id: true,
                                                    });
                                                }}
                                                className="text-xs text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1 font-medium"
                                            >
                                                <span>Don't have an Employee ID yet?</span>
                                                <span className="text-blue-600 dark:text-blue-400 font-bold underline">
                                                    Tap here
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Session Countdown Timer */}
                                {attendance && invalid_status === null && remainingTime && remainingTime !== "0" && (
                                    <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-center animate-pulse-subtle">
                                        <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Session Closes In:</span>
                                            <span className="font-mono text-sm tracking-wide bg-amber-500/20 px-2 py-0.5 rounded-md text-amber-900 dark:text-amber-200">
                                                {remainingTime}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                            Closes at {closeAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <NotInLocation
                        locationService={locationService}
                        distance={distance}
                        activeMapLocation={activeMapLocation}
                        userCoords={userCoords}
                    />
                )}
            </div>
        </AppLayout>
    );
}
