import React, { useEffect, useState, useRef, useMemo } from "react";
import AppLayout from "@/layouts/app-layout";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import {
    Edit,
    Plus,
    Calendar,
    MapPin,
    Clock,
    Trash2,
    Search,
    RotateCcw,
    CheckCircle2,
    Copy,
    Check,
    Navigation,
    Shield,
    CalendarDays,
    SlidersHorizontal,
    Globe,
    Layers,
    Timer,
    AlertCircle,
    X,
} from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/Components/ui/checkbox";
import { useForm, router, usePage } from "@inertiajs/react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { GoogleMap, MarkerF as Marker, CircleF as Circle } from "@react-google-maps/api";
import useGoogleMaps from "@/hooks/use-google-maps";
import axios from "axios";

// Helper for effective schedule times
function getEffectiveLocationTime(loc, schedules = []) {
    if (loc.schedule_id) {
        const sched = schedules.find((s) => s.id === loc.schedule_id) || loc.schedule;
        if (sched) {
            return {
                open_time: sched.open_time,
                closing_time: sched.closing_time,
                name: sched.name,
            };
        }
    }
    return {
        open_time: loc.open_time,
        closing_time: loc.closing_time,
        name: null,
    };
}

export default function Settings({
    attendanceList,
    is_admin,
    map_coordinates,
    mapLocations: initialMapLocations,
    schedules: initialSchedules,
}) {
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [openAttendanceModal, setOpenAttendanceModal] = useState(false);
    const [mapLocationModalOpen, setMapLocationModalOpen] = useState(false);
    const [selectedMapLocation, setSelectedMapLocation] = useState(null);
    const [mapLocations, setMapLocations] = useState(initialMapLocations || []);
    const [mapLocationSearch, setMapLocationSearch] = useState("");
    const [activeTab, setActiveTab] = useState("attendance");
    const [search, setSearch] = useState("");
    const [schedules, setSchedules] = useState(initialSchedules || []);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [scheduleSearch, setScheduleSearch] = useState("");
    const [copiedToken, setCopiedToken] = useState(null);

    const fetchMapLocations = async () => {
        try {
            const response = await axios.get("/api/map-locations");
            setMapLocations(response.data);
        } catch (error) {
            console.error("Error fetching map locations:", error);
        }
    };

    const fetchSchedules = async () => {
        try {
            const response = await axios.get("/api/schedules");
            setSchedules(response.data);
        } catch (error) {
            console.error("Error fetching schedules:", error);
        }
    };

    const handleDeleteSchedule = async (id) => {
        if (!confirm("Are you sure you want to delete this schedule?")) return;
        try {
            await axios.delete(`/api/schedules/${id}`);
            toast.success("Schedule deleted successfully!");
            fetchSchedules();
        } catch (error) {
            console.error("Error deleting schedule:", error);
            toast.error("Failed to delete schedule");
        }
    };

    const handleDeleteMapLocation = async (id) => {
        if (!confirm("Are you sure you want to delete this map location?")) return;
        try {
            await axios.delete(`/api/map-locations/${id}`);
            toast.success("Map location deleted successfully!");
            fetchMapLocations();
        } catch (error) {
            console.error("Error deleting map location:", error);
            toast.error("Failed to delete map location");
        }
    };

    const copyTokenUrl = (token) => {
        if (!token) return;
        const url = `${window.location.origin}/?token=${token}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedToken(token);
            toast.success("Scanner URL copied to clipboard!");
            setTimeout(() => setCopiedToken(null), 2000);
        });
    };

    const getStatusInfo = (attendance) => {
        if (!attendance.is_active) {
            return {
                label: "Inactive",
                badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
                dotClass: "bg-slate-400",
            };
        }

        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const currentTime = now.toTimeString().slice(0, 8);
        const openDate = attendance.open_date;
        const closingDate = attendance.closing_date;
        const locs = attendance.map_locations || [];

        if (!openDate || !closingDate || locs.length === 0) {
            return {
                label: "No Schedule",
                badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
                dotClass: "bg-slate-400",
            };
        }

        if (today < openDate) {
            return {
                label: "Scheduled",
                badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
                dotClass: "bg-blue-500",
            };
        }

        if (today > closingDate) {
            return {
                label: "Closed",
                badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
                dotClass: "bg-slate-400",
            };
        }

        const hasActiveLocation = locs.some((loc) => {
            return (
                loc.open_time &&
                loc.closing_time &&
                currentTime >= loc.open_time &&
                currentTime < loc.closing_time
            );
        });

        if (!hasActiveLocation) {
            const hasNotOpenYet = locs.some(
                (loc) => loc.open_time && currentTime < loc.open_time
            );
            if (hasNotOpenYet) {
                return {
                    label: "Not Open Yet",
                    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
                    dotClass: "bg-amber-500",
                };
            }
            return {
                label: "Closed Today",
                badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
                dotClass: "bg-slate-400",
            };
        }

        return {
            label: "Active Now",
            badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
            dotClass: "bg-emerald-500 animate-pulse",
        };
    };

    const getLocationStatusInfo = (loc) => {
        const { open_time: ot, closing_time: ct } = getEffectiveLocationTime(
            loc,
            schedules
        );
        if (!ot || !ct) {
            return {
                label: "No Schedule",
                badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
            };
        }
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 8);

        if (currentTime < ot) {
            return {
                label: "Not Open",
                badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
            };
        }
        if (currentTime >= ct) {
            return {
                label: "Closed",
                badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
            };
        }
        return {
            label: "Active Now",
            badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
    };

    // Filtered lists
    const filteredLocations = useMemo(() => {
        const q = mapLocationSearch.toLowerCase().trim();
        if (!q) return mapLocations;
        return mapLocations.filter(
            (loc) =>
                loc.location.toLowerCase().includes(q) ||
                (loc.description && loc.description.toLowerCase().includes(q))
        );
    }, [mapLocations, mapLocationSearch]);

    const filteredSchedules = useMemo(() => {
        const q = scheduleSearch.toLowerCase().trim();
        if (!q) return schedules;
        return schedules.filter((s) => s.name.toLowerCase().includes(q));
    }, [schedules, scheduleSearch]);

    /* =========================================================================
       SUB-COMPONENTS FOR FORMS
    ========================================================================= */

    const CreateAttendanceForm = () => {
        const [loading, setLoading] = useState(false);
        const useCreateForm = useForm({
            id: selectedAttendance?.id || "",
            name: selectedAttendance?.title || "",
            is_active: selectedAttendance?.is_active || false,
            map_location_ids:
                (selectedAttendance?.map_locations || []).map((l) => l.id) || [],
            open_date: selectedAttendance?.open_date || "",
            closing_date: selectedAttendance?.closing_date || "",
            no_location: !!selectedAttendance?.no_location,
        });

        const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
                await axios.post("/store_attendance/settings", useCreateForm.data);
                setOpenAttendanceModal(false);
                toast.success(
                    selectedAttendance
                        ? "Attendance updated successfully!"
                        : "Attendance created successfully!"
                );
                router.reload();
            } catch (error) {
                if (error.response?.data?.errors) {
                    useCreateForm.setError(error.response.data.errors);
                }
                toast.error("Failed to save attendance.");
            } finally {
                setLoading(false);
            }
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-xs font-bold text-slate-700">
                        Session Title *
                    </Label>
                    <Input
                        id="title"
                        required
                        value={useCreateForm.data.name}
                        onChange={(e) => useCreateForm.setData("name", e.target.value)}
                        placeholder="e.g. Daily Hospital Morning Shift"
                        className="h-11 rounded-xl text-sm"
                    />
                    {useCreateForm.errors.name && (
                        <p className="text-rose-500 text-xs">{useCreateForm.errors.name}</p>
                    )}
                </div>

                {/* Date Ranges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="open_date" className="text-xs font-bold text-slate-700">
                            Open Date *
                        </Label>
                        <Input
                            id="open_date"
                            type="date"
                            required
                            value={useCreateForm.data.open_date}
                            onChange={(e) => useCreateForm.setData("open_date", e.target.value)}
                            className="h-11 rounded-xl text-xs"
                        />
                        {useCreateForm.errors.open_date && (
                            <p className="text-rose-500 text-xs">
                                {useCreateForm.errors.open_date}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="closing_date" className="text-xs font-bold text-slate-700">
                            Closing Date *
                        </Label>
                        <Input
                            id="closing_date"
                            type="date"
                            required
                            value={useCreateForm.data.closing_date}
                            onChange={(e) =>
                                useCreateForm.setData("closing_date", e.target.value)
                            }
                            className="h-11 rounded-xl text-xs"
                        />
                        {useCreateForm.errors.closing_date && (
                            <p className="text-rose-500 text-xs">
                                {useCreateForm.errors.closing_date}
                            </p>
                        )}
                    </div>
                </div>

                {/* Map Locations Checkbox Selection */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-slate-700">
                            Allowed Locations
                        </Label>
                        <span className="text-[11px] text-slate-400">
                            {useCreateForm.data.map_location_ids.length} selected
                        </span>
                    </div>

                    <div
                        className={`max-h-44 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 space-y-1.5 bg-slate-50/50 dark:bg-slate-800/40 ${
                            useCreateForm.data.no_location
                                ? "opacity-40 pointer-events-none"
                                : ""
                        }`}
                    >
                        {mapLocations.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-4">
                                No map locations created yet.
                            </p>
                        ) : (
                            mapLocations.map((loc) => (
                                <label
                                    key={loc.id}
                                    htmlFor={`loc-${loc.id}`}
                                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                >
                                    <Checkbox
                                        id={`loc-${loc.id}`}
                                        checked={useCreateForm.data.map_location_ids.includes(
                                            loc.id
                                        )}
                                        onCheckedChange={(checked) => {
                                            const current =
                                                useCreateForm.data.map_location_ids || [];
                                            if (checked) {
                                                useCreateForm.setData("map_location_ids", [
                                                    ...current,
                                                    loc.id,
                                                ]);
                                            } else {
                                                useCreateForm.setData(
                                                    "map_location_ids",
                                                    current.filter((id) => id !== loc.id)
                                                );
                                            }
                                        }}
                                    />
                                    <div className="text-xs">
                                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                                            {loc.location}
                                        </span>
                                        {loc.description && (
                                            <span className="text-slate-400 ml-1.5">
                                                — {loc.description}
                                            </span>
                                        )}
                                    </div>
                                </label>
                            ))
                        )}
                    </div>
                </div>

                {/* Toggles */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                            id="is_active"
                            checked={useCreateForm.data.is_active}
                            onCheckedChange={(checked) =>
                                useCreateForm.setData("is_active", !!checked)
                            }
                        />
                        <div className="text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-100 block">
                                Set as Active Session
                            </span>
                            <span className="text-slate-500 text-[11px]">
                                Makes this session the live attendance session for employees
                            </span>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-slate-200/60 dark:border-slate-700">
                        <Checkbox
                            id="no_location"
                            checked={useCreateForm.data.no_location}
                            onCheckedChange={(checked) =>
                                useCreateForm.setData("no_location", !!checked)
                            }
                        />
                        <div className="text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-100 block">
                                Free Entry (No Geofence Required)
                            </span>
                            <span className="text-slate-500 text-[11px]">
                                Disables radius check; employees can submit from anywhere
                            </span>
                        </div>
                    </label>
                </div>

                <DialogFooter className="flex-row gap-2 pt-2 sm:justify-end">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 sm:flex-none h-11 rounded-xl text-xs"
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 sm:flex-none h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs active:scale-95 shadow-sm"
                    >
                        {loading ? (
                            <>
                                <LoaderCircle className="w-4 h-4 mr-1.5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Attendance"
                        )}
                    </Button>
                </DialogFooter>
            </form>
        );
    };

    const MapLocationForm = () => {
        const [loading, setLoading] = useState(false);
        const { isLoaded: mapsReady } = useGoogleMaps();
        const mapRef = useRef(null);

        const useMapLocationForm = useForm({
            id: selectedMapLocation?.id || "",
            location: selectedMapLocation?.location || "",
            description: selectedMapLocation?.description || "",
            lat: selectedMapLocation?.lat || "",
            lng: selectedMapLocation?.lng || "",
            schedule_id: selectedMapLocation?.schedule_id || "",
            open_time: selectedMapLocation?.open_time
                ? selectedMapLocation.open_time.slice(0, 5)
                : "",
            closing_time: selectedMapLocation?.closing_time
                ? selectedMapLocation.closing_time.slice(0, 5)
                : "",
            is_default: !!selectedMapLocation?.is_default,
            w_map: !!selectedMapLocation?.w_map,
        });

        const mapCenter =
            useMapLocationForm.data.lat && useMapLocationForm.data.lng
                ? {
                      lat: parseFloat(useMapLocationForm.data.lat),
                      lng: parseFloat(useMapLocationForm.data.lng),
                  }
                : { lat: 6.907257, lng: 122.080909 };

        const handleMapClick = (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            useMapLocationForm.setData((prev) => ({
                ...prev,
                lat: lat.toFixed(6),
                lng: lng.toFixed(6),
            }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
                const payload = {
                    location: useMapLocationForm.data.location,
                    description: useMapLocationForm.data.description,
                    lat: parseFloat(useMapLocationForm.data.lat),
                    lng: parseFloat(useMapLocationForm.data.lng),
                    schedule_id: useMapLocationForm.data.schedule_id || null,
                    open_time: useMapLocationForm.data.schedule_id
                        ? null
                        : useMapLocationForm.data.open_time || null,
                    closing_time: useMapLocationForm.data.schedule_id
                        ? null
                        : useMapLocationForm.data.closing_time || null,
                    is_default: useMapLocationForm.data.is_default,
                    w_map: useMapLocationForm.data.w_map,
                };

                if (useMapLocationForm.data.id) {
                    await axios.put(
                        `/api/map-locations/${useMapLocationForm.data.id}`,
                        payload
                    );
                    toast.success("Location updated successfully!");
                } else {
                    await axios.post("/api/map-locations", payload);
                    toast.success("Location created successfully!");
                }

                setMapLocationModalOpen(false);
                fetchMapLocations();
            } catch (error) {
                if (error.response?.data?.errors) {
                    useMapLocationForm.setError(error.response.data.errors);
                }
                toast.error("Failed to save map location");
            } finally {
                setLoading(false);
            }
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                    <Label htmlFor="loc-name" className="text-xs font-bold text-slate-700">
                        Location Name *
                    </Label>
                    <Input
                        id="loc-name"
                        required
                        value={useMapLocationForm.data.location}
                        onChange={(e) =>
                            useMapLocationForm.setData("location", e.target.value)
                        }
                        placeholder="e.g. ZCMC OPD Building Main Entrance"
                        className="h-11 rounded-xl text-sm"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="loc-desc" className="text-xs font-bold text-slate-700">
                        Description / Floor (Optional)
                    </Label>
                    <Input
                        id="loc-desc"
                        value={useMapLocationForm.data.description}
                        onChange={(e) =>
                            useMapLocationForm.setData("description", e.target.value)
                        }
                        placeholder="e.g. Ground Floor Lobby"
                        className="h-11 rounded-xl text-sm"
                    />
                </div>

                {/* Map Picker */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <Label className="font-bold text-slate-700">
                            Pin Location on Map
                        </Label>
                        <span className="text-slate-400 text-[11px]">
                            Tap map to set GPS
                        </span>
                    </div>

                    {mapsReady ? (
                        <div className="h-48 sm:h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "100%" }}
                                center={mapCenter}
                                zoom={17}
                                options={{
                                    zoomControl: true,
                                    mapTypeControl: false,
                                    streetViewControl: false,
                                    fullscreenControl: false,
                                }}
                                onClick={handleMapClick}
                            >
                                {useMapLocationForm.data.lat &&
                                    useMapLocationForm.data.lng && (
                                        <>
                                            <Marker
                                                position={{
                                                    lat: parseFloat(useMapLocationForm.data.lat),
                                                    lng: parseFloat(useMapLocationForm.data.lng),
                                                }}
                                            />
                                            <Circle
                                                center={{
                                                    lat: parseFloat(useMapLocationForm.data.lat),
                                                    lng: parseFloat(useMapLocationForm.data.lng),
                                                }}
                                                radius={30}
                                                options={{
                                                    fillColor: "#3b82f6",
                                                    fillOpacity: 0.2,
                                                    strokeColor: "#3b82f6",
                                                    strokeWeight: 2,
                                                }}
                                            />
                                        </>
                                    )}
                            </GoogleMap>
                        </div>
                    ) : (
                        <div className="h-48 rounded-2xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                            Loading Google Maps...
                        </div>
                    )}
                </div>

                {/* Coordinates manual inputs */}
                <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                        <Label htmlFor="lat" className="text-[11px] font-bold text-slate-700">
                            Latitude *
                        </Label>
                        <Input
                            id="lat"
                            required
                            type="number"
                            step="any"
                            value={useMapLocationForm.data.lat}
                            onChange={(e) =>
                                useMapLocationForm.setData("lat", e.target.value)
                            }
                            className="h-10 rounded-xl font-mono text-xs"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="lng" className="text-[11px] font-bold text-slate-700">
                            Longitude *
                        </Label>
                        <Input
                            id="lng"
                            required
                            type="number"
                            step="any"
                            value={useMapLocationForm.data.lng}
                            onChange={(e) =>
                                useMapLocationForm.setData("lng", e.target.value)
                            }
                            className="h-10 rounded-xl font-mono text-xs"
                        />
                    </div>
                </div>

                {/* Schedule Selector */}
                <div className="space-y-1.5">
                    <Label htmlFor="sched-select" className="text-xs font-bold text-slate-700">
                        Linked Schedule
                    </Label>
                    <select
                        id="sched-select"
                        value={useMapLocationForm.data.schedule_id}
                        onChange={(e) =>
                            useMapLocationForm.setData("schedule_id", e.target.value)
                        }
                        className="w-full h-11 rounded-xl border border-input bg-transparent px-3 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Custom (manual hours below)</option>
                        {schedules.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} ({s.open_time?.slice(0, 5)} - {s.closing_time?.slice(0, 5)})
                            </option>
                        ))}
                    </select>
                </div>

                {!useMapLocationForm.data.schedule_id && (
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                            <Label className="text-[11px] font-bold text-slate-700">
                                Open Time *
                            </Label>
                            <Input
                                type="time"
                                required
                                value={useMapLocationForm.data.open_time}
                                onChange={(e) =>
                                    useMapLocationForm.setData("open_time", e.target.value)
                                }
                                className="h-10 rounded-xl text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[11px] font-bold text-slate-700">
                                Closing Time *
                            </Label>
                            <Input
                                type="time"
                                required
                                value={useMapLocationForm.data.closing_time}
                                onChange={(e) =>
                                    useMapLocationForm.setData("closing_time", e.target.value)
                                }
                                className="h-10 rounded-xl text-xs"
                            />
                        </div>
                    </div>
                )}

                {/* Options */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 space-y-2.5">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                        <Checkbox
                            id="is_default"
                            checked={useMapLocationForm.data.is_default}
                            onCheckedChange={(checked) =>
                                useMapLocationForm.setData("is_default", !!checked)
                            }
                        />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            Set as Default Location
                        </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t border-slate-200/60">
                        <Checkbox
                            id="w_map"
                            checked={useMapLocationForm.data.w_map}
                            onCheckedChange={(checked) =>
                                useMapLocationForm.setData("w_map", !!checked)
                            }
                        />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            Show live map on Out-of-Location warning
                        </span>
                    </label>
                </div>

                <DialogFooter className="flex-row gap-2 pt-2 sm:justify-end">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 sm:flex-none h-11 rounded-xl text-xs"
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 sm:flex-none h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs active:scale-95 shadow-sm"
                    >
                        {loading ? (
                            <>
                                <LoaderCircle className="w-4 h-4 mr-1.5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Location"
                        )}
                    </Button>
                </DialogFooter>
            </form>
        );
    };

    const ScheduleForm = () => {
        const [loading, setLoading] = useState(false);
        const useScheduleForm = useForm({
            id: selectedSchedule?.id || "",
            name: selectedSchedule?.name || "",
            open_time: selectedSchedule?.open_time
                ? selectedSchedule.open_time.slice(0, 5)
                : "",
            closing_time: selectedSchedule?.closing_time
                ? selectedSchedule.closing_time.slice(0, 5)
                : "",
        });

        const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
                const payload = {
                    name: useScheduleForm.data.name,
                    open_time: useScheduleForm.data.open_time,
                    closing_time: useScheduleForm.data.closing_time,
                };

                if (useScheduleForm.data.id) {
                    await axios.put(`/api/schedules/${useScheduleForm.data.id}`, payload);
                    toast.success("Schedule updated successfully!");
                } else {
                    await axios.post("/api/schedules", payload);
                    toast.success("Schedule created successfully!");
                }

                setScheduleModalOpen(false);
                fetchSchedules();
            } catch (error) {
                if (error.response?.data?.errors) {
                    useScheduleForm.setError(error.response.data.errors);
                }
                toast.error("Failed to save schedule");
            } finally {
                setLoading(false);
            }
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                    <Label htmlFor="sched-name" className="text-xs font-bold text-slate-700">
                        Schedule Name *
                    </Label>
                    <Input
                        id="sched-name"
                        required
                        value={useScheduleForm.data.name}
                        onChange={(e) => useScheduleForm.setData("name", e.target.value)}
                        placeholder="e.g. Flag Ceremony AM or Shift 1"
                        className="h-11 rounded-xl text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                        <Label htmlFor="open_time" className="text-xs font-bold text-slate-700">
                            Open Time *
                        </Label>
                        <Input
                            id="open_time"
                            type="time"
                            required
                            value={useScheduleForm.data.open_time}
                            onChange={(e) =>
                                useScheduleForm.setData("open_time", e.target.value)
                            }
                            className="h-11 rounded-xl text-xs"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="closing_time" className="text-xs font-bold text-slate-700">
                            Closing Time *
                        </Label>
                        <Input
                            id="closing_time"
                            type="time"
                            required
                            value={useScheduleForm.data.closing_time}
                            onChange={(e) =>
                                useScheduleForm.setData("closing_time", e.target.value)
                            }
                            className="h-11 rounded-xl text-xs"
                        />
                    </div>
                </div>

                <DialogFooter className="flex-row gap-2 pt-2 sm:justify-end">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 sm:flex-none h-11 rounded-xl text-xs"
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 sm:flex-none h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs active:scale-95 shadow-sm"
                    >
                        {loading ? (
                            <>
                                <LoaderCircle className="w-4 h-4 mr-1.5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Schedule"
                        )}
                    </Button>
                </DialogFooter>
            </form>
        );
    };

    return (
        <AppLayout title="Settings" is_admin={is_admin} w_admin={true}>
            <div className="w-full max-w-sm sm:max-w-4xl mx-auto space-y-4 py-1 animate-in fade-in duration-300">
                {/* Title and Intro */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-1">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            System Settings
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Configure attendance sessions, campus geofences, and schedules
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Administrator Mode</span>
                    </div>
                </div>

                {/* Main Tabs Container */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
                    {/* Modern Segmented Pill Control */}
                    <TabsList className="grid grid-cols-3 p-1.5 bg-slate-200/60 dark:bg-slate-800/80 rounded-2xl h-auto">
                        <TabsTrigger
                            value="attendance"
                            className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-1.5"
                        >
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Sessions</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="map-location"
                            className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-1.5"
                        >
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Locations</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="schedules"
                            className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-1.5"
                        >
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Schedules</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* =========================================================================
                        TAB 1: ATTENDANCE SESSIONS
                    ========================================================================= */}
                    <TabsContent value="attendance" className="space-y-4 focus:outline-none">
                        {/* Search & Create Action Bar */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <Input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search attendance sessions..."
                                    className="pl-9 h-11 text-xs rounded-xl"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch("");
                                            router.visit("/settings");
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        router.get(
                                            "/settings",
                                            { search },
                                            { preserveState: true, preserveScroll: true }
                                        );
                                    }}
                                    className="h-11 px-4 rounded-xl text-xs bg-slate-900 hover:bg-slate-800 text-white active:scale-95"
                                >
                                    Filter
                                </Button>

                                <Dialog
                                    open={openAttendanceModal}
                                    onOpenChange={setOpenAttendanceModal}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            className="flex-1 sm:flex-none h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95"
                                            onClick={() => setSelectedAttendance(null)}
                                        >
                                            <Plus className="w-4 h-4 mr-1.5" />
                                            <span>New Session</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-3xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-base font-bold">
                                                {selectedAttendance ? "Edit Session" : "Create New Session"}
                                            </DialogTitle>
                                            <DialogDescription className="text-xs">
                                                Define attendance title, allowed geofence locations, and dates.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <CreateAttendanceForm />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {/* Mobile Cards (Screen < 768px) */}
                        <div className="block md:hidden space-y-3">
                            {attendanceList?.data?.length === 0 ? (
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                                    No attendance sessions found.
                                </div>
                            ) : (
                                attendanceList?.data?.map((att) => {
                                    const status = getStatusInfo(att);
                                    return (
                                        <div
                                            key={att.id}
                                            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
                                        >
                                            {/* Header with Badges */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.badgeClass}`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`}
                                                    />
                                                    <span>{status.label}</span>
                                                </div>

                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                        att.no_location
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-emerald-100 text-emerald-800"
                                                    }`}
                                                >
                                                    {att.no_location ? "Free Entry" : "Geofenced"}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                                {att.title}
                                            </h3>

                                            {/* Details */}
                                            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>
                                                        {att.open_date && att.closing_date
                                                            ? `${att.open_date} → ${att.closing_date}`
                                                            : "No active date set"}
                                                    </span>
                                                </div>

                                                <div className="flex items-start gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                    <span className="truncate">
                                                        {att.no_location
                                                            ? "Any Location"
                                                            : (att.map_locations || []).length > 0
                                                            ? att.map_locations
                                                                  .map((l) => l.location)
                                                                  .join(", ")
                                                            : "No locations linked"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedAttendance(att);
                                                        setOpenAttendanceModal(true);
                                                    }}
                                                    className="h-9 px-3 rounded-xl text-xs gap-1.5 font-semibold text-blue-600"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                    <span>Edit Session</span>
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Desktop Table (Screen >= 768px) */}
                        <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                        <TableHead className="font-bold">Session Title</TableHead>
                                        <TableHead className="font-bold">Status</TableHead>
                                        <TableHead className="font-bold">Type</TableHead>
                                        <TableHead className="font-bold">Locations</TableHead>
                                        <TableHead className="font-bold">Date Range</TableHead>
                                        <TableHead className="text-right font-bold">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendanceList?.data?.map((att) => {
                                        const status = getStatusInfo(att);
                                        return (
                                            <TableRow key={att.id}>
                                                <TableCell className="font-bold text-slate-900 dark:text-white">
                                                    {att.title}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.badgeClass}`}
                                                    >
                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`}
                                                        />
                                                        <span>{status.label}</span>
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                                                            att.no_location
                                                                ? "bg-blue-100 text-blue-700"
                                                                : "bg-emerald-100 text-emerald-800"
                                                        }`}
                                                    >
                                                        {att.no_location ? "Free Entry" : "Geofenced"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                                                    {att.no_location
                                                        ? "—"
                                                        : (att.map_locations || []).length > 0
                                                        ? att.map_locations.map((l) => l.location).join(", ")
                                                        : "No locations"}
                                                </TableCell>
                                                <TableCell className="text-xs font-mono text-slate-500">
                                                    {att.open_date && att.closing_date
                                                        ? `${att.open_date} → ${att.closing_date}`
                                                        : "—"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedAttendance(att);
                                                            setOpenAttendanceModal(true);
                                                        }}
                                                        className="h-8 px-2.5 rounded-lg text-xs"
                                                    >
                                                        <Edit className="w-3.5 h-3.5 text-blue-500 mr-1" />
                                                        Edit
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {attendanceList?.meta?.links?.length > 3 && (
                            <div className="py-2 flex justify-center">
                                <Pagination>
                                    <PaginationContent className="flex-wrap justify-center gap-1">
                                        {attendanceList?.meta?.links?.map((link, key) => {
                                            if (key === 0) {
                                                return (
                                                    <PaginationItem key={key}>
                                                        <PaginationPrevious
                                                            href={attendanceList?.links?.prev}
                                                        />
                                                    </PaginationItem>
                                                );
                                            }
                                            if (
                                                key ===
                                                attendanceList?.meta?.links?.length - 1
                                            ) {
                                                return (
                                                    <PaginationItem key={key}>
                                                        <PaginationNext
                                                            href={attendanceList?.links?.next}
                                                        />
                                                    </PaginationItem>
                                                );
                                            }
                                            return (
                                                <PaginationItem key={link.label}>
                                                    <PaginationLink
                                                        href={link.url}
                                                        isActive={link.active}
                                                        className="text-xs rounded-lg"
                                                    >
                                                        {link.label}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        })}
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </TabsContent>

                    {/* =========================================================================
                        TAB 2: MAP LOCATIONS
                    ========================================================================= */}
                    <TabsContent value="map-location" className="space-y-4 focus:outline-none">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <Input
                                    type="text"
                                    value={mapLocationSearch}
                                    onChange={(e) => setMapLocationSearch(e.target.value)}
                                    placeholder="Search campus locations..."
                                    className="pl-9 h-11 text-xs rounded-xl"
                                />
                                {mapLocationSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setMapLocationSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <Dialog
                                open={mapLocationModalOpen}
                                onOpenChange={setMapLocationModalOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95"
                                        onClick={() => setSelectedMapLocation(null)}
                                    >
                                        <Plus className="w-4 h-4 mr-1.5" />
                                        <span>New Location</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-3xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-base font-bold">
                                            {selectedMapLocation
                                                ? "Edit Location"
                                                : "Create Campus Location"}
                                        </DialogTitle>
                                        <DialogDescription className="text-xs">
                                            Configure GPS coordinates, geofence radius, and daily schedule.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <MapLocationForm />
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Mobile Cards (Screen < 768px) */}
                        <div className="block md:hidden space-y-3">
                            {filteredLocations.length === 0 ? (
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                                    No locations match your search.
                                </div>
                            ) : (
                                filteredLocations.map((loc) => {
                                    const status = getLocationStatusInfo(loc);
                                    const effective = getEffectiveLocationTime(loc, schedules);
                                    return (
                                        <div
                                            key={loc.id}
                                            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
                                        >
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {loc.location}
                                                    </h3>
                                                    {loc.description && (
                                                        <p className="text-xs text-slate-400 mt-0.5">
                                                            {loc.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span
                                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.badgeClass}`}
                                                    >
                                                        {status.label}
                                                    </span>
                                                    {Boolean(loc.is_default) && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Badges / Hours / Coordinates */}
                                            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                    <span className="font-medium text-slate-700 dark:text-slate-200">
                                                        {effective.name ? `${effective.name} • ` : ""}
                                                        {effective.open_time?.slice(0, 5) || "—"} →{" "}
                                                        {effective.closing_time?.slice(0, 5) || "—"}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Navigation className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="font-mono text-[11px]">
                                                        {loc.lat}, {loc.lng}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Quick Copy Link */}
                                            {loc.token && (
                                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                                    <span className="text-[11px] font-mono text-slate-500 truncate">
                                                        /?token={loc.token.slice(0, 12)}...
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyTokenUrl(loc.token)}
                                                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 shrink-0 px-2 py-1 rounded-md active:bg-blue-50"
                                                    >
                                                        {copiedToken === loc.token ? (
                                                            <>
                                                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                                <span className="text-emerald-600">Copied</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-3.5 h-3.5" />
                                                                <span>Copy Link</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                                    {loc.w_map ? "Map Enabled" : "Map Disabled"}
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedMapLocation(loc);
                                                            setMapLocationModalOpen(true);
                                                        }}
                                                        className="h-8 px-2.5 rounded-lg text-xs"
                                                    >
                                                        <Edit className="w-3.5 h-3.5 text-blue-500 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDeleteMapLocation(loc.id)}
                                                        className="h-8 px-2.5 rounded-lg text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Desktop Table (Screen >= 768px) */}
                        <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                        <TableHead className="font-bold">Location</TableHead>
                                        <TableHead className="font-bold">Schedule</TableHead>
                                        <TableHead className="font-bold">Coordinates</TableHead>
                                        <TableHead className="font-bold">Token Link</TableHead>
                                        <TableHead className="font-bold">Status</TableHead>
                                        <TableHead className="text-right font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLocations.map((loc) => {
                                        const status = getLocationStatusInfo(loc);
                                        const effective = getEffectiveLocationTime(loc, schedules);
                                        return (
                                            <TableRow key={loc.id}>
                                                <TableCell>
                                                    <div className="font-bold text-slate-900 dark:text-white">
                                                        {loc.location}
                                                    </div>
                                                    {loc.description && (
                                                        <div className="text-xs text-slate-400">
                                                            {loc.description}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                        {effective.name || "Custom Hours"}
                                                    </span>
                                                    <div className="text-slate-400 font-mono text-[11px]">
                                                        {effective.open_time?.slice(0, 5) || "—"} -{" "}
                                                        {effective.closing_time?.slice(0, 5) || "—"}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-slate-500">
                                                    {loc.lat}, {loc.lng}
                                                </TableCell>
                                                <TableCell>
                                                    {loc.token ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => copyTokenUrl(loc.token)}
                                                            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                            <span>Copy Link</span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${status.badgeClass}`}
                                                    >
                                                        {status.label}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-1.5 justify-end">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSelectedMapLocation(loc);
                                                                setMapLocationModalOpen(true);
                                                            }}
                                                            className="h-8 px-2 rounded-lg"
                                                        >
                                                            <Edit className="w-3.5 h-3.5 text-blue-500" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDeleteMapLocation(loc.id)}
                                                            className="h-8 px-2 rounded-lg text-rose-500 border-rose-200 hover:bg-rose-50"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    {/* =========================================================================
                        TAB 3: SCHEDULES
                    ========================================================================= */}
                    <TabsContent value="schedules" className="space-y-4 focus:outline-none">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <Input
                                    type="text"
                                    value={scheduleSearch}
                                    onChange={(e) => setScheduleSearch(e.target.value)}
                                    placeholder="Search predefined schedules..."
                                    className="pl-9 h-11 text-xs rounded-xl"
                                />
                                {scheduleSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setScheduleSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <Dialog
                                open={scheduleModalOpen}
                                onOpenChange={setScheduleModalOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95"
                                        onClick={() => setSelectedSchedule(null)}
                                    >
                                        <Plus className="w-4 h-4 mr-1.5" />
                                        <span>New Schedule</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md rounded-3xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-base font-bold">
                                            {selectedSchedule ? "Edit Schedule" : "Create Schedule"}
                                        </DialogTitle>
                                        <DialogDescription className="text-xs">
                                            Define opening and closing time window.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <ScheduleForm />
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Mobile Cards (Screen < 768px) */}
                        <div className="block md:hidden space-y-3">
                            {filteredSchedules.length === 0 ? (
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                                    No schedules match your search.
                                </div>
                            ) : (
                                filteredSchedules.map((sched) => (
                                    <div
                                        key={sched.id}
                                        className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3"
                                    >
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                {sched.name}
                                            </h3>
                                            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>
                                                    {sched.open_time?.slice(0, 5)} →{" "}
                                                    {sched.closing_time?.slice(0, 5)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-1.5 shrink-0">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedSchedule(sched);
                                                    setScheduleModalOpen(true);
                                                }}
                                                className="h-9 px-2.5 rounded-xl text-xs"
                                            >
                                                <Edit className="w-3.5 h-3.5 text-blue-500" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDeleteSchedule(sched.id)}
                                                className="h-9 px-2.5 rounded-xl text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop Table (Screen >= 768px) */}
                        <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                        <TableHead className="font-bold">Schedule Name</TableHead>
                                        <TableHead className="font-bold">Opening Time</TableHead>
                                        <TableHead className="font-bold">Closing Time</TableHead>
                                        <TableHead className="text-right font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSchedules.map((sched) => (
                                        <TableRow key={sched.id}>
                                            <TableCell className="font-bold text-slate-900 dark:text-white">
                                                {sched.name}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {sched.open_time?.slice(0, 5)}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {sched.closing_time?.slice(0, 5)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-1.5 justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedSchedule(sched);
                                                            setScheduleModalOpen(true);
                                                        }}
                                                        className="h-8 px-2 rounded-lg"
                                                    >
                                                        <Edit className="w-3.5 h-3.5 text-blue-500" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDeleteSchedule(sched.id)}
                                                        className="h-8 px-2 rounded-lg text-rose-500 border-rose-200 hover:bg-rose-50"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
