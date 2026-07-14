import React, { useEffect, useState } from "react";
import AppLayout from "@/layouts/app-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useForm } from "@inertiajs/react";
import {
    AlertCircle,
    LoaderCircle,
    MapPin,
    Link as LinkIcon,
    Calendar,
    Clock,
    Save,
    Settings,
    CheckCircle2,
    CalendarClock,
    Lock,
    Timer,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

const pickerStyles = `
    .date-time-input::-webkit-calendar-picker-indicator {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        cursor: pointer;
        opacity: 0;
    }
    .date-time-input {
        position: relative;
    }
`;

function getAttendanceStatus(attendance) {
    if (!attendance) return { label: "No Active Attendance", variant: "destructive", icon: AlertCircle };

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 5);
    const openDate = attendance.open_date;
    const closingDate = attendance.closing_date;
    const mapLocations = attendance.map_locations || [];

    if (!openDate || !closingDate || mapLocations.length === 0) {
        return { label: "No Schedule", variant: "secondary", icon: AlertCircle };
    }

    if (today < openDate) {
        return { label: "Scheduled", variant: "default", icon: CalendarClock };
    }
    if (today > closingDate) {
        return { label: "Closed", variant: "secondary", icon: Lock };
    }

    const hasActive = mapLocations.some((loc) => {
        const ot = loc.open_time?.slice(0, 5);
        const ct = loc.closing_time?.slice(0, 5);
        return ot && ct && currentTime >= ot && currentTime < ct;
    });
    const hasNotOpenYet = mapLocations.some((loc) => {
        const ot = loc.open_time?.slice(0, 5);
        return ot && currentTime < ot;
    });

    if (hasActive) return { label: "Active Now", variant: "success", icon: CheckCircle2 };
    if (hasNotOpenYet) return { label: "Not Open Yet", variant: "default", icon: Timer };
    return { label: "Closed", variant: "secondary", icon: Lock };
}

function getStatusMessage(attendance) {
    if (!attendance) return "Create an active attendance to begin scanning.";

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 5);
    const openDate = attendance.open_date;
    const closingDate = attendance.closing_date;
    const mapLocations = attendance.map_locations || [];

    if (!openDate || !closingDate || mapLocations.length === 0) {
        return "Set a date range and time window to activate attendance.";
    }
    if (today < openDate) {
        return `Attendance opens on ${openDate}.`;
    }
    if (today > closingDate) {
        return `Attendance closed on ${closingDate}.`;
    }

    const hasActive = mapLocations.some((loc) => {
        const ot = loc.open_time?.slice(0, 5);
        const ct = loc.closing_time?.slice(0, 5);
        return ot && ct && currentTime >= ot && currentTime < ct;
    });
    if (hasActive) {
        const closingTime = mapLocations.find((loc) => {
            const ot = loc.open_time?.slice(0, 5);
            const ct = loc.closing_time?.slice(0, 5);
            return ot && ct && currentTime >= ot && currentTime < ct;
        })?.closing_time?.slice(0, 5);
        return `Attendance is open today until ${closingTime}.`;
    }

    const hasNotOpenYet = mapLocations.some((loc) => {
        const ot = loc.open_time?.slice(0, 5);
        return ot && currentTime < ot;
    });
    if (hasNotOpenYet) {
        const openTime = mapLocations.find((loc) => {
            const ot = loc.open_time?.slice(0, 5);
            return ot && currentTime < ot;
        })?.open_time?.slice(0, 5);
        return `Attendance opens today at ${openTime}.`;
    }

    return `Attendance closed for today.`;
}

export default function ActiveConfiguration({ attendance, is_admin }) {
    const [showLocationDetails, setShowLocationDetails] = useState(false);
    const mapLocations = attendance?.map_locations || [];
    const savedToken = typeof window !== "undefined" ? localStorage.getItem("attendanceToken") : null;
    const defaultLoc = mapLocations.find((loc) => loc.token === savedToken) || mapLocations[0] || null;
    const [selectedLocationToken, setSelectedLocationToken] = useState(defaultLoc?.token || "");

    const selectedLocation = mapLocations.find((loc) => loc.token === selectedLocationToken) || mapLocations[0] || null;

    const useCreateForm = useForm({
        id: "",
        name: "",
        map_location_id: "",
        open_date: "",
        closing_date: "",
        open_time: "",
        closing_time: "",
    });

    useEffect(() => {
        if (attendance && selectedLocation) {
            useCreateForm.setData({
                id: attendance.id,
                name: attendance.title,
                map_location_id: selectedLocation.id,
                open_date: attendance.open_date || "",
                closing_date: attendance.closing_date || "",
                open_time: selectedLocation.open_time ? selectedLocation.open_time.slice(0, 5) : "",
                closing_time: selectedLocation.closing_time ? selectedLocation.closing_time.slice(0, 5) : "",
            });
        }
    }, [attendance, selectedLocationToken]);

    const handleLocationChange = (token) => {
        setSelectedLocationToken(token);
        localStorage.setItem("attendanceToken", token);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await useCreateForm.post("/update-active", {
            onSuccess: () => {
                toast.success("Attendance configuration updated successfully");
            },
            onError: () => {
                toast.error("Attendance configuration update failed");
            },
        });
    };

    const copyTokenUrl = () => {
        if (selectedLocation?.token) {
            const url = `${window.location.origin}/?token=${selectedLocation.token}`;
            navigator.clipboard.writeText(url);
            toast.success("Attendance URL copied to clipboard");
        }
    };

    const status = getAttendanceStatus(attendance);
    const StatusIcon = status.icon;

    return (
        <AppLayout title="Active Configuration" is_admin={is_admin} w_admin={true}>
            <style>{pickerStyles}</style>
            <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 w-full max-w-full sm:max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                        Active Attendance Configuration
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage the currently active attendance session, its schedule, and location.
                    </p>
                </div>

                {!attendance ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <div className="bg-red-50 p-4 rounded-full mb-4">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                No Active Attendance
                            </h2>
                            <p className="mt-2 text-sm text-gray-500 max-w-full sm:max-w-sm">
                                No active attendance session is currently set. Create and activate an attendance from the Settings page to start scanning.
                            </p>
                            <Button
                                className="mt-6"
                                variant="outline"
                                onClick={() => (window.location.href = "/settings")}
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Go to Settings
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4 sm:space-y-6">
                        <Card className="border-l-4 border-l-green-500 shadow-sm">
                            <CardContent className="p-3 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                                            <StatusIcon className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                                                    {attendance.title}
                                                </h2>
                                                <Badge
                                                    variant={status.variant === "success" ? "default" : status.variant}
                                                    className={status.variant === "success" ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                                                >
                                                    {status.label}
                                                </Badge>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {getStatusMessage(attendance)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyTokenUrl}
                                        className="shrink-0"
                                    >
                                        <LinkIcon className="w-4 h-4 mr-2" />
                                        Copy URL
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {selectedLocation && (
                            <Card className="border-l-4 border-l-blue-500 shadow-sm">
                                <CardContent className="p-3 sm:p-6">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                                            <MapPin className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                                Your Current Location
                                            </div>
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                                {selectedLocation.location}
                                            </h3>
                                            {selectedLocation.description && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {selectedLocation.description}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                                                <span className="font-mono">
                                                    {selectedLocation.lat}, {selectedLocation.lng}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {selectedLocation.open_time?.slice(0, 5)} — {selectedLocation.closing_time?.slice(0, 5)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 gap-6">
                            <Card className="shadow-sm w-full">
                                <button
                                    type="button"
                                    onClick={() => setShowLocationDetails((v) => !v)}
                                    className="w-full text-left"
                                >
                                    <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50/50 transition-colors rounded-t-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="p-3 sm:p-4">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-blue-500" />
                                                    Location Details
                                                </CardTitle>
                                                <CardDescription>
                                                    Map location linked to this attendance session.
                                                </CardDescription>
                                            </div>
                                            {showLocationDetails ? (
                                                <ChevronUp className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </CardHeader>
                                </button>
                                {showLocationDetails && <CardContent className="space-y-4 p-3 sm:p-6">
                                    {(attendance.map_locations || []).map((loc, idx) => (
                                        <div key={loc.id} className="space-y-2">
                                            {idx > 0 && <Separator />}
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-sm text-gray-500">Location {idx + 1}</span>
                                                <span className="text-sm font-medium text-gray-900 text-right">
                                                    {loc.location || "—"}
                                                </span>
                                            </div>
                                            {loc.description && (
                                                <div className="py-2 border-b border-gray-100">
                                                    <span className="text-sm text-gray-500 block mb-1">Description</span>
                                                    <span className="text-sm text-gray-900">
                                                        {loc.description}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-sm text-gray-500">Coordinates</span>
                                                <span className="text-sm font-mono text-gray-900 text-right">
                                                    {loc.lat}, {loc.lng}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            }
                            </Card>
                        </div>

                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 p-3 sm:p-4">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    Schedule Settings
                                </CardTitle>
                                <CardDescription>
                                    Update the active date range and daily time window.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-6">
                                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="map_location" className="text-sm font-medium">
                                            Select Location
                                        </Label>
                                        <div className="relative w-full">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <select
                                                id="map_location"
                                                value={selectedLocationToken}
                                                onChange={(e) => handleLocationChange(e.target.value)}
                                                className="pl-10 w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                            >
                                                {mapLocations.map((loc) => (
                                                    <option key={loc.id} value={loc.token}>
                                                        {loc.location}{loc.description ? ` — ${loc.description}` : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-1 gap-3 sm:gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="open_date" className="text-sm font-medium">
                                                Open Date
                                            </Label>
                                            <div className="relative w-full">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    id="open_date"
                                                    name="open_date"
                                                    type="date"
                                                    required
                                                    value={useCreateForm.data.open_date}
                                                    onChange={(e) => useCreateForm.setData("open_date", e.target.value)}
                                                    className="pl-10 w-full date-time-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="closing_date" className="text-sm font-medium">
                                                Closing Date
                                            </Label>
                                            <div className="relative w-full">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    id="closing_date"
                                                    name="closing_date"
                                                    type="date"
                                                    required
                                                    value={useCreateForm.data.closing_date}
                                                    onChange={(e) => useCreateForm.setData("closing_date", e.target.value)}
                                                    className="pl-10 w-full date-time-input"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-1 gap-3 sm:gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="open_time" className="text-sm font-medium">
                                                Open Time
                                            </Label>
                                            <div className="relative w-full">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    id="open_time"
                                                    name="open_time"
                                                    type="time"
                                                    required
                                                    value={useCreateForm.data.open_time}
                                                    onChange={(e) => useCreateForm.setData("open_time", e.target.value)}
                                                    className="pl-10 w-full date-time-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="closing_time" className="text-sm font-medium">
                                                Closing Time
                                            </Label>
                                            <div className="relative w-full">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    id="closing_time"
                                                    name="closing_time"
                                                    type="time"
                                                    required
                                                    value={useCreateForm.data.closing_time}
                                                    onChange={(e) => useCreateForm.setData("closing_time", e.target.value)}
                                                    className="pl-10 w-full date-time-input"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={useCreateForm.processing}
                                            className="min-w-[160px]"
                                        >
                                            {useCreateForm.processing ? (
                                                <>
                                                    <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
