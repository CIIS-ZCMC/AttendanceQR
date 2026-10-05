import React, { useEffect, useState, useMemo } from "react";
import AppLayout from "@/layouts/app-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/Components/ui/dialog";
import { useForm, router } from "@inertiajs/react";
import {
    AlertCircle,
    LoaderCircle,
    MapPin,
    Calendar,
    Clock,
    Save,
    Settings,
    CheckCircle2,
    CalendarClock,
    Lock,
    Timer,
    QrCode,
    Copy,
    Check,
    ExternalLink,
    Sparkles,
    Zap,
    Layers,
    CheckSquare,
    Square,
    SlidersHorizontal,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

// Date formatting helper YYYY-MM-DD
function formatDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Effective operating times for a location
function getEffectiveTime(loc) {
    if (loc?.schedule) {
        return {
            open_time: loc.schedule.open_time,
            closing_time: loc.schedule.closing_time,
            scheduleName: loc.schedule.name,
        };
    }
    return {
        open_time: loc?.open_time,
        closing_time: loc?.closing_time,
        scheduleName: null,
    };
}

// Attendance session status evaluator
function getAttendanceStatus(attendance) {
    if (!attendance) return { label: "No Active Attendance", variant: "destructive", icon: AlertCircle };

    const now = new Date();
    const today = formatDate(now);
    const currentTime = now.toTimeString().slice(0, 5);
    const openDate = attendance.open_date;
    const closingDate = attendance.closing_date;
    const mapLocations = attendance.map_locations || attendance.mapLocations || [];

    if (!openDate || !closingDate) {
        return { label: "No Dates Set", variant: "secondary", icon: AlertCircle };
    }

    if (today < openDate) {
        return { label: "Scheduled Ahead", variant: "default", icon: CalendarClock };
    }
    if (today > closingDate) {
        return { label: "Session Expired", variant: "secondary", icon: Lock };
    }

    if (mapLocations.length === 0 && !attendance.no_location) {
        return { label: "No Stations Linked", variant: "secondary", icon: AlertCircle };
    }

    const hasActive = mapLocations.some((loc) => {
        const { open_time: ot, closing_time: ct } = getEffectiveTime(loc);
        return ot && ct && currentTime >= ot.slice(0, 5) && currentTime < ct.slice(0, 5);
    });
    const hasNotOpenYet = mapLocations.some((loc) => {
        const { open_time: ot } = getEffectiveTime(loc);
        return ot && currentTime < ot.slice(0, 5);
    });

    if (hasActive) return { label: "Live & Open Now", variant: "success", icon: CheckCircle2 };
    if (hasNotOpenYet) return { label: "Not Open Yet", variant: "warning", icon: Timer };
    return { label: "Closed for Today", variant: "secondary", icon: Lock };
}

// Helper to initialize location schedules map
function initLocationSchedules(locations = []) {
    const map = {};
    locations.forEach((loc) => {
        const isCustom = !loc.schedule_id && !!loc.open_time;
        map[loc.id] = {
            schedule_id: loc.schedule_id || "",
            open_time: loc.open_time ? loc.open_time.slice(0, 5) : "08:00",
            closing_time: loc.closing_time ? loc.closing_time.slice(0, 5) : "17:00",
            is_custom: isCustom,
        };
    });
    return map;
}

export default function ActiveConfiguration({
    attendance,
    mapLocations: allMapLocations = [],
    schedules = [],
    allAttendances = [],
    is_admin = false,
}) {
    // Current live time ticker
    const [currentTimeString, setCurrentTimeString] = useState(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTimeString(
                new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
            );
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Stations assigned to current attendance
    const assignedLocations = useMemo(() => {
        return attendance?.map_locations || attendance?.mapLocations || [];
    }, [attendance]);

    // Active station token selection (for station preview)
    const [selectedLocationToken, setSelectedLocationToken] = useState(
        assignedLocations[0]?.token || allMapLocations[0]?.token || ""
    );

    useEffect(() => {
        if (assignedLocations.length > 0 && !assignedLocations.some((l) => l.token === selectedLocationToken)) {
            setSelectedLocationToken(assignedLocations[0].token);
        }
    }, [assignedLocations]);

    const activeStation = useMemo(() => {
        return (
            assignedLocations.find((loc) => loc.token === selectedLocationToken) ||
            allMapLocations.find((loc) => loc.token === selectedLocationToken) ||
            assignedLocations[0] ||
            null
        );
    }, [assignedLocations, allMapLocations, selectedLocationToken]);

    // QR Code Modal State
    const [qrModalLocation, setQrModalLocation] = useState(null);
    const [copiedToken, setCopiedToken] = useState(null);

    // Track which location's schedule editor is open
    const [expandedLocationId, setExpandedLocationId] = useState(null);

    // Master Bulk Schedule Tool State ("Same Schedule for All")
    const [bulkScheduleId, setBulkScheduleId] = useState(schedules[0]?.id || "");
    const [bulkIsCustom, setBulkIsCustom] = useState(false);
    const [bulkOpenTime, setBulkOpenTime] = useState("08:00");
    const [bulkClosingTime, setBulkClosingTime] = useState("17:00");

    // Form setup with Inertia useForm
    const { data, setData, post, processing, errors, isDirty } = useForm({
        id: attendance?.id || "",
        name: attendance?.title || "",
        open_date: attendance?.open_date || "",
        closing_date: attendance?.closing_date || "",
        map_location_ids: assignedLocations.map((loc) => loc.id),
        location_schedules: initLocationSchedules(allMapLocations),
        no_location: attendance?.no_location || false,
    });

    // Synchronize form when attendance or allMapLocations changes
    useEffect(() => {
        if (attendance) {
            setData((prev) => ({
                ...prev,
                id: attendance.id,
                name: attendance.title || "",
                open_date: attendance.open_date || "",
                closing_date: attendance.closing_date || "",
                map_location_ids: assignedLocations.map((loc) => loc.id),
                location_schedules: initLocationSchedules(allMapLocations),
                no_location: attendance.no_location || false,
            }));
        }
    }, [attendance, allMapLocations]);

    // Toggle Station Assignment
    const toggleStationAssignment = (stationId) => {
        setData((prev) => {
            const currentIds = prev.map_location_ids || [];
            const exists = currentIds.includes(stationId);
            const nextIds = exists
                ? currentIds.filter((id) => id !== stationId)
                : [...currentIds, stationId];
            return {
                ...prev,
                map_location_ids: nextIds,
            };
        });
    };

    // Select All / Deselect All Stations
    const toggleAllStations = () => {
        if (data.map_location_ids.length === allMapLocations.length) {
            setData("map_location_ids", []);
        } else {
            setData("map_location_ids", allMapLocations.map((l) => l.id));
        }
    };

    // Update single location schedule in form state
    const updateLocationSchedule = (locId, key, value) => {
        setData((prev) => {
            const currentLocSched = prev.location_schedules?.[locId] || {
                schedule_id: "",
                open_time: "08:00",
                closing_time: "17:00",
                is_custom: false,
            };

            const updatedLoc = {
                ...currentLocSched,
                [key]: value,
            };

            if (key === "schedule_id" && value) {
                updatedLoc.is_custom = false;
            }

            return {
                ...prev,
                location_schedules: {
                    ...prev.location_schedules,
                    [locId]: updatedLoc,
                },
            };
        });
    };

    // Toggle single location mode (template vs custom)
    const toggleLocationMode = (locId, isCustom) => {
        setData((prev) => {
            const currentLocSched = prev.location_schedules?.[locId] || {
                schedule_id: schedules[0]?.id || "",
                open_time: "08:00",
                closing_time: "17:00",
                is_custom: false,
            };

            return {
                ...prev,
                location_schedules: {
                    ...prev.location_schedules,
                    [locId]: {
                        ...currentLocSched,
                        is_custom: isCustom,
                        schedule_id: isCustom ? "" : (currentLocSched.schedule_id || (schedules[0]?.id || "")),
                    },
                },
            };
        });
    };

    // Master Tool: Apply SAME schedule across all locations
    const handleApplyToAllLocations = () => {
        const targetIds =
            data.map_location_ids && data.map_location_ids.length > 0
                ? data.map_location_ids
                : allMapLocations.map((l) => l.id);

        if (targetIds.length === 0) {
            toast.error("No campus locations available to configure.");
            return;
        }

        setData((prev) => {
            const nextSchedules = { ...prev.location_schedules };

            targetIds.forEach((locId) => {
                nextSchedules[locId] = {
                    schedule_id: bulkIsCustom ? "" : bulkScheduleId,
                    open_time: bulkOpenTime,
                    closing_time: bulkClosingTime,
                    is_custom: bulkIsCustom,
                };
            });

            return {
                ...prev,
                map_location_ids: targetIds,
                location_schedules: nextSchedules,
            };
        });

        const schedObj = schedules.find((s) => s.id == bulkScheduleId);
        const label = bulkIsCustom
            ? `Custom (${bulkOpenTime} - ${bulkClosingTime})`
            : schedObj?.name || "Selected Template";

        toast.success(`Applied ${label} to all ${targetIds.length} stations!`);
    };

    // Submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        post("/update-active", {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Active attendance configuration saved successfully!");
            },
            onError: () => {
                toast.error("Failed to update active configuration. Check form values.");
            },
        });
    };

    // Switch active session
    const handleSwitchSession = (sessionId) => {
        if (!sessionId) return;
        router.post(
            "/update-active",
            { switch_active_id: sessionId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Active session switched successfully");
                },
                onError: () => {
                    toast.error("Failed to switch session");
                },
            }
        );
    };

    // Copy QR Link
    const copyStationUrl = (token, stationName) => {
        if (!token) return;
        const url = `${window.location.origin}/?token=${token}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedToken(token);
            toast.success(`Scanner URL for "${stationName || "Station"}" copied!`);
            setTimeout(() => setCopiedToken(null), 2500);
        });
    };

    // Calculate days duration
    const daysDuration = useMemo(() => {
        if (!data.open_date || !data.closing_date) return null;
        const d1 = new Date(data.open_date);
        const d2 = new Date(data.closing_date);
        const diffTime = d2 - d1;
        if (diffTime < 0) return "Invalid range";
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays === 1 ? "1 day" : `${diffDays} days`;
    }, [data.open_date, data.closing_date]);

    const status = getAttendanceStatus(attendance);
    const StatusIcon = status.icon;

    return (
        <AppLayout title="Active Configuration" is_admin={is_admin} w_admin={true}>
            <div className="w-full max-w-xl mx-auto space-y-4 pb-12 animate-in fade-in duration-300">
                {/* Header Banner */}
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-medium tracking-wide">
                                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                                <span>Attendance Session Control</span>
                                <span className="bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded text-[9px]">
                                    LIVE
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Active Configuration</h1>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                                Configure the active attendance session, operating windows, and QR station access.
                            </p>
                        </div>

                        {/* Clock & Status Pill */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 shrink-0 pt-1 border-t border-slate-800 sm:border-0">
                            <div className="flex items-center gap-1.5 font-mono text-xs text-blue-300 font-bold bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                                <Clock className="w-3.5 h-3.5 text-blue-400" />
                                <span>{currentTimeString}</span>
                            </div>
                            <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                    status.variant === "success"
                                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                        : status.variant === "warning"
                                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                        : "bg-slate-700/60 text-slate-300 border-slate-600"
                                }`}
                            >
                                {status.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Session Switcher Card */}
                {allAttendances.length > 0 && (
                    <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Current Active Session:
                                </span>
                            </div>
                            <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                                <select
                                    value={attendance?.id || ""}
                                    onChange={(e) => handleSwitchSession(e.target.value)}
                                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs font-semibold text-slate-800 dark:text-slate-200 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                >
                                    {allAttendances.map((att) => (
                                        <option key={att.id} value={att.id}>
                                            {att.title} {att.is_active ? "★ (Active)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Empty State when no attendance session exists */}
                {!attendance ? (
                    <Card className="border-dashed border-2 rounded-3xl p-8 text-center bg-white dark:bg-slate-900">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                            <AlertCircle className="w-7 h-7" />
                        </div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            No Active Attendance Session
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                            Select one of the existing attendance sessions below to activate it immediately, or create a new session in Settings.
                        </p>
                        {allAttendances.length > 0 ? (
                            <div className="max-w-md mx-auto space-y-2">
                                {allAttendances.slice(0, 5).map((att) => (
                                    <div
                                        key={att.id}
                                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-left"
                                    >
                                        <div className="truncate mr-2">
                                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                                {att.title}
                                            </h4>
                                            <span className="text-[10px] text-slate-400">
                                                {att.open_date} to {att.closing_date}
                                            </span>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleSwitchSession(att.id)}
                                            className="h-8 rounded-xl text-xs font-semibold bg-blue-600 text-white"
                                        >
                                            Activate
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Button
                                onClick={() => (window.location.href = "/settings")}
                                className="h-10 rounded-xl text-xs font-semibold bg-blue-600 text-white"
                            >
                                <Settings className="w-4 h-4 mr-1.5" />
                                Go to Settings
                            </Button>
                        )}
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {/* Live Session Status Card */}
                        <Card
                            className={`rounded-3xl border shadow-sm transition-all overflow-hidden ${
                                status.variant === "success"
                                    ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20"
                                    : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900"
                            }`}
                        >
                            <CardContent className="p-4 sm:p-5 space-y-3.5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                                                status.variant === "success"
                                                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                                                    : "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                                            }`}
                                        >
                                            <StatusIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                                    {attendance.title}
                                                </h2>
                                                <Badge
                                                    className={`text-[10px] px-2 py-0 font-bold border-none ${
                                                        status.variant === "success"
                                                            ? "bg-emerald-500 text-white"
                                                            : status.variant === "warning"
                                                            ? "bg-amber-500 text-white"
                                                            : "bg-slate-500 text-white"
                                                    }`}
                                                >
                                                    {status.label}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                Active from{" "}
                                                <strong className="text-slate-700 dark:text-slate-300">
                                                    {attendance.open_date}
                                                </strong>{" "}
                                                until{" "}
                                                <strong className="text-slate-700 dark:text-slate-300">
                                                    {attendance.closing_date}
                                                </strong>{" "}
                                                ({daysDuration || "N/A"})
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick Link/QR trigger */}
                                    {activeStation && (
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setQrModalLocation(activeStation)}
                                                className="h-8 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800"
                                                title="View QR Code"
                                            >
                                                <QrCode className="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                                                <span>QR Code</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => copyStationUrl(activeStation.token, activeStation.location)}
                                                className="h-8 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800"
                                                title="Copy live scanner link"
                                            >
                                                {copiedToken === activeStation.token ? (
                                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Active Summary Pills */}
                                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                                    <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                            Active Calendar Range
                                        </span>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                                            {attendance.open_date} – {attendance.closing_date}
                                        </span>
                                    </div>
                                    <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                            Active Stations Linked
                                        </span>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                                            {data.map_location_ids.length} of {allMapLocations.length} locations active
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* ======================================================== */}
                        {/* CONFIGURATION FORM                                       */}
                        {/* ======================================================== */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Card: Session Schedule & Fast Presets */}
                            <Card className="shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                                <CardHeader className="pb-3 pt-4 px-4 sm:px-5 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                Session Details & Calendar Dates
                                            </CardTitle>
                                            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                                                Set dates for the overall attendance session
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 sm:p-5 space-y-4">
                                    {/* Session Title Field (Read-only) */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="session_name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Session Name
                                            </Label>
                                            <span className="text-[10px] font-semibold text-slate-400">
                                                Read-only
                                            </span>
                                        </div>
                                        <Input
                                            id="session_name"
                                            value={data.name}
                                            readOnly
                                            disabled
                                            placeholder="Attendance Session Name"
                                            className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 cursor-not-allowed select-none"
                                        />
                                    </div>

                                    {/* Date Range */}
                                    <div className="space-y-2 pt-1">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                                <span>Active Date Range</span>
                                            </Label>
                                            {daysDuration && (
                                                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                                                    Duration: {daysDuration}
                                                </span>
                                            )}
                                        </div>

                                        {/* Date Inputs Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                            <div className="space-y-1">
                                                <Label htmlFor="open_date" className="text-[11px] font-semibold text-slate-500">
                                                    Start / Open Date
                                                </Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <Input
                                                        id="open_date"
                                                        type="date"
                                                        required
                                                        value={data.open_date}
                                                        onChange={(e) => setData("open_date", e.target.value)}
                                                        className="pl-9 h-11 rounded-2xl bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <Label htmlFor="closing_date" className="text-[11px] font-semibold text-slate-500">
                                                    End / Closing Date
                                                </Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <Input
                                                        id="closing_date"
                                                        type="date"
                                                        required
                                                        value={data.closing_date}
                                                        onChange={(e) => setData("closing_date", e.target.value)}
                                                        className="pl-9 h-11 rounded-2xl bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ======================================================== */}
                            {/* MASTER TOOL: APPLY SAME SCHEDULE TO ALL LOCATIONS        */}
                            {/* ======================================================== */}
                            <Card className="shadow-sm border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 rounded-3xl overflow-hidden">
                                <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                    Bulk Action: Same Schedule for All Locations
                                                </CardTitle>
                                                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                                                    Quickly assign the same operating window across all gates in one click
                                                </CardDescription>
                                            </div>
                                        </div>

                                        {/* Bulk Mode Switcher */}
                                        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-xl text-[11px]">
                                            <button
                                                type="button"
                                                onClick={() => setBulkIsCustom(false)}
                                                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                                                    !bulkIsCustom
                                                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                                                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                                                }`}
                                            >
                                                Template
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setBulkIsCustom(true)}
                                                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                                                    bulkIsCustom
                                                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                                                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                                                }`}
                                            >
                                                Custom
                                            </button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 sm:p-5 pt-2 space-y-3">
                                    {!bulkIsCustom ? (
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <select
                                                value={bulkScheduleId}
                                                onChange={(e) => setBulkScheduleId(e.target.value)}
                                                className="flex-1 h-11 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                            >
                                                {schedules.map((sched) => (
                                                    <option key={sched.id} value={sched.id}>
                                                        {sched.name} ({sched.open_time?.slice(0, 5)} – {sched.closing_time?.slice(0, 5)})
                                                    </option>
                                                ))}
                                            </select>
                                            <Button
                                                type="button"
                                                onClick={handleApplyToAllLocations}
                                                className="h-11 px-5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 active:scale-95 shadow-xs"
                                            >
                                                <Zap className="w-3.5 h-3.5 mr-1.5" />
                                                Apply to All Stations
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <div className="grid grid-cols-2 gap-2 flex-1">
                                                <Input
                                                    type="time"
                                                    value={bulkOpenTime}
                                                    onChange={(e) => setBulkOpenTime(e.target.value)}
                                                    className="h-11 rounded-2xl bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold font-mono"
                                                />
                                                <Input
                                                    type="time"
                                                    value={bulkClosingTime}
                                                    onChange={(e) => setBulkClosingTime(e.target.value)}
                                                    className="h-11 rounded-2xl bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold font-mono"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={handleApplyToAllLocations}
                                                className="h-11 px-5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 active:scale-95 shadow-xs"
                                            >
                                                <Zap className="w-3.5 h-3.5 mr-1.5" />
                                                Apply to All Stations
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* ======================================================== */}
                            {/* PER-LOCATION SCHEDULE CONFIGURATION                      */}
                            {/* ======================================================== */}
                            <Card className="shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                                <CardHeader className="pb-3 pt-4 px-4 sm:px-5 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                    Station Operating Schedules
                                                </CardTitle>
                                                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                                                    Assign same or different schedules per individual station
                                                </CardDescription>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={toggleAllStations}
                                            className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                                        >
                                            {data.map_location_ids.length === allMapLocations.length
                                                ? "Deselect All"
                                                : "Select All"}
                                        </button>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 sm:p-5 space-y-3">
                                    {allMapLocations.length === 0 ? (
                                        <div className="text-center py-6 text-xs text-slate-400">
                                            No map locations configured yet. Add them in Settings.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {allMapLocations.map((loc) => {
                                                const isAssigned = data.map_location_ids.includes(loc.id);
                                                const locSched = data.location_schedules?.[loc.id] || {
                                                    schedule_id: "",
                                                    open_time: "08:00",
                                                    closing_time: "17:00",
                                                    is_custom: false,
                                                };
                                                const isExpanded = expandedLocationId === loc.id || isAssigned;

                                                // Find applied schedule object
                                                const appliedSched = schedules.find((s) => s.id == locSched.schedule_id);

                                                return (
                                                    <div
                                                        key={loc.id}
                                                        className={`rounded-2xl border transition-all overflow-hidden ${
                                                            isAssigned
                                                                ? "bg-slate-50/70 dark:bg-slate-850 border-slate-200 dark:border-slate-750 shadow-2xs"
                                                                : "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 opacity-60"
                                                        }`}
                                                    >
                                                        {/* Station Header Bar */}
                                                        <div className="p-3.5 flex items-start justify-between gap-3">
                                                            {/* Checkbox & Station Name */}
                                                            <div
                                                                className="flex items-start gap-3 cursor-pointer flex-1 min-w-0"
                                                                onClick={() => toggleStationAssignment(loc.id)}
                                                            >
                                                                <div className="mt-0.5 shrink-0">
                                                                    {isAssigned ? (
                                                                        <CheckSquare className="w-4 h-4 text-blue-600" />
                                                                    ) : (
                                                                        <Square className="w-4 h-4 text-slate-400" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 break-words">
                                                                            {loc.location || `Station #${loc.id}`}
                                                                        </h4>
                                                                        {Boolean(loc.is_default) && (
                                                                            <span className="text-[9px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-bold text-slate-700 dark:text-slate-300 shrink-0">
                                                                                Default
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {loc.description && (
                                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                                                                            {loc.description}
                                                                        </p>
                                                                    )}
                                                                    {/* Active Schedule Tag under Location Name */}
                                                                    {isAssigned && (
                                                                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                                                                {locSched.is_custom
                                                                                    ? `Custom: ${locSched.open_time} – ${locSched.closing_time}`
                                                                                    : appliedSched
                                                                                    ? `${appliedSched.name} (${appliedSched.open_time?.slice(0, 5)} – ${appliedSched.closing_time?.slice(0, 5)})`
                                                                                    : "No Schedule Assigned"}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Actions (QR & Copy) */}
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                {/* QR Code Button */}
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => setQrModalLocation(loc)}
                                                                    className="h-8 px-2 rounded-xl text-xs border-slate-200 dark:border-slate-800"
                                                                    title="Show QR Code"
                                                                >
                                                                    <QrCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                                </Button>

                                                                {/* Copy URL Button */}
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => copyStationUrl(loc.token, loc.location)}
                                                                    className="h-8 px-2 rounded-xl text-xs border-slate-200 dark:border-slate-800"
                                                                    title="Copy Direct URL"
                                                                >
                                                                    {copiedToken === loc.token ? (
                                                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                                    ) : (
                                                                        <Copy className="w-3.5 h-3.5" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Individual Station Schedule Controls (When Assigned) */}
                                                        {isAssigned && (
                                                            <div className="px-3.5 pb-3.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-750 bg-white/70 dark:bg-slate-900/60 space-y-3">
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                                            Set schedule for:
                                                                        </span>
                                                                        <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-900">
                                                                            {loc.location || `Station #${loc.id}`}
                                                                        </span>
                                                                    </div>

                                                                    {/* Mode Switcher for this specific station */}
                                                                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] self-start sm:self-auto shrink-0">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleLocationMode(loc.id, false)}
                                                                            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                                                                                !locSched.is_custom
                                                                                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                                                                                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                                                                            }`}
                                                                        >
                                                                            Template
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleLocationMode(loc.id, true)}
                                                                            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                                                                                locSched.is_custom
                                                                                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                                                                                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                                                                            }`}
                                                                        >
                                                                            Custom
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Template Selection for this location */}
                                                                {!locSched.is_custom ? (
                                                                    <div className="space-y-2">
                                                                        <select
                                                                            value={locSched.schedule_id}
                                                                            onChange={(e) => updateLocationSchedule(loc.id, "schedule_id", e.target.value)}
                                                                            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                                                        >
                                                                            <option value="">-- Choose Schedule Template --</option>
                                                                            {schedules.map((sched) => (
                                                                                <option key={sched.id} value={sched.id}>
                                                                                    {sched.name} ({sched.open_time?.slice(0, 5)} – {sched.closing_time?.slice(0, 5)})
                                                                                </option>
                                                                            ))}
                                                                        </select>

                                                                        {/* Clickable Quick Chips for this location */}
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {schedules.map((sched) => {
                                                                                const isSelected = locSched.schedule_id == sched.id;
                                                                                return (
                                                                                    <button
                                                                                        key={sched.id}
                                                                                        type="button"
                                                                                        onClick={() => updateLocationSchedule(loc.id, "schedule_id", sched.id)}
                                                                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border active:scale-95 ${
                                                                                            isSelected
                                                                                                ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                                                                                : "bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                                                                                        }`}
                                                                                    >
                                                                                        {sched.name} ({sched.open_time?.slice(0, 5)} - {sched.closing_time?.slice(0, 5)})
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    /* Custom Hours for this location (Direct inputs, no suggestions) */
                                                                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                                                                        <div className="space-y-1">
                                                                            <span className="text-[10px] font-semibold text-slate-500">
                                                                                Open Time
                                                                            </span>
                                                                            <Input
                                                                                type="time"
                                                                                value={locSched.open_time}
                                                                                onChange={(e) => updateLocationSchedule(loc.id, "open_time", e.target.value)}
                                                                                className="h-10 rounded-xl bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-xs font-semibold font-mono"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <span className="text-[10px] font-semibold text-slate-500">
                                                                                Closing Time
                                                                            </span>
                                                                            <Input
                                                                                type="time"
                                                                                value={locSched.closing_time}
                                                                                onChange={(e) => updateLocationSchedule(loc.id, "closing_time", e.target.value)}
                                                                                className="h-10 rounded-xl bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-xs font-semibold font-mono"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Floating / Sticky Save Bar */}
                            <div className="sticky bottom-20 z-30 pt-2">
                                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between gap-3">
                                    <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                                        {isDirty ? (
                                            <span className="text-amber-600 font-bold flex items-center gap-1">
                                                <Sparkles className="w-3.5 h-3.5" /> Unsaved changes pending
                                            </span>
                                        ) : (
                                            <span>Current settings are synchronized</span>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full sm:w-auto h-11 px-8 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all ml-auto flex items-center justify-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="w-4 h-4 animate-spin" />
                                                <span>Saving Configuration...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>Save Configuration</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* ======================================================== */}
                {/* QR CODE DISPLAY MODAL                                     */}
                {/* ======================================================== */}
                {qrModalLocation && (
                    <Dialog open={Boolean(qrModalLocation)} onOpenChange={() => setQrModalLocation(null)}>
                        <DialogContent className="max-w-xs sm:max-w-sm rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                            <DialogHeader>
                                <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1.5">
                                    <QrCode className="w-4 h-4 text-blue-600" />
                                    <span>Station QR Code</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-500">
                                    {qrModalLocation.location}
                                    {qrModalLocation.description ? ` (${qrModalLocation.description})` : ""}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="py-4 space-y-4">
                                {/* Generated High-Res QR Code Image */}
                                <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-200/80 inline-block mx-auto">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=4&data=${encodeURIComponent(
                                            `${window.location.origin}/?token=${qrModalLocation.token}`
                                        )}`}
                                        alt={`QR code for ${qrModalLocation.location}`}
                                        className="w-52 h-52 mx-auto object-contain"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                        Scan Destination
                                    </span>
                                    <p className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all bg-slate-50 dark:bg-slate-850 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700">
                                        {window.location.origin}/?token={qrModalLocation.token}
                                    </p>
                                </div>
                            </div>

                            <DialogFooter className="flex-col sm:flex-row gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyStationUrl(qrModalLocation.token, qrModalLocation.location)}
                                    className="w-full h-10 rounded-xl text-xs font-semibold"
                                >
                                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                                    Copy Link
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => window.open(`/?token=${qrModalLocation.token}`, "_blank")}
                                    className="w-full h-10 rounded-xl text-xs font-semibold bg-blue-600 text-white"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                    Test Scan
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AppLayout>
    );
}
