import React from "react";
import AppLayout from "@/layouts/app-layout";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Edit, Plus, Calendar, MapPin } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
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
import { BadgeCheckIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Trash } from "lucide-react";
import { Checkbox } from "@/Components/ui/checkbox";
import { route } from "ziggy-js";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import { useEffect } from "react";

export default function Settings({ attendanceList, is_admin, map_coordinates, mapLocations: initialMapLocations }) {
    const [selectedAttendance, setSelectedAttendance] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [mapModalOpen, setMapModalOpen] = React.useState(false);
    const [mapLocationModalOpen, setMapLocationModalOpen] = React.useState(false);
    const [selectedMapLocation, setSelectedMapLocation] = React.useState(null);
    const [mapLocations, setMapLocations] = React.useState(initialMapLocations || []);
    const [mapLocationSearch, setMapLocationSearch] = React.useState("");
    const [activeTab, setActiveTab] = React.useState("attendance");
    const page = usePage();
    const [search, setSearch] = React.useState("");

    const fetchMapLocations = async () => {
        try {
            const response = await axios.get('/api/map-locations');
            setMapLocations(response.data);
        } catch (error) {
            console.error('Error fetching map locations:', error);
        }
    };

    const CreateAttendance = () => {
        const [loading, setLoading] = React.useState(false);
        const useCreateForm = useForm({
            id: "",
            name: "",
            is_active: false,
            map_location_ids: [],
            open_date: "",
            closing_date: "",
            no_location: false,
        });

        useEffect(() => {
            if (selectedAttendance) {
                useCreateForm.setData({
                    id: selectedAttendance.id,
                    name: selectedAttendance.title,
                    is_active: selectedAttendance.is_active,
                    map_location_ids: (selectedAttendance.map_locations || []).map((loc) => loc.id),
                    open_date: selectedAttendance.open_date || "",
                    closing_date: selectedAttendance.closing_date || "",
                    no_location: !!selectedAttendance.no_location,
                });
            }
        }, [selectedAttendance]);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);

            await axios
                .post("/store_attendance/settings", useCreateForm.data)
                .then(() => {
                    setOpen(false);
                    window.location.reload();
                })
                .catch((error) => {
                    useCreateForm.setError(error.response.data.errors);
                    toast.error("Attendance creation failed");
                    setOpen(true);
                })
                .finally(() => {
                    setLoading(false);
                });
        };

        const oneHourThirtyAhead = new Date();
        oneHourThirtyAhead.setMinutes(oneHourThirtyAhead.getMinutes() + 90);
        const minValue = oneHourThirtyAhead.toISOString().slice(0, 16);

        return (
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 mb-4">
                    <div className="grid gap-3">
                        <Label htmlFor="name-1">Title</Label>
                        <Input
                            required
                            id="name-1"
                            name="name"
                            value={useCreateForm.data.name}
                            onChange={(e) =>
                                useCreateForm.setData("name", e.target.value)
                            }
                        />
                        {useCreateForm.errors.name && (
                            <p className="text-red-500 text-xs">
                                {useCreateForm.errors.name}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="map_location_ids">Map Locations</Label>
                        <div className={`max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2 ${useCreateForm.data.no_location ? 'opacity-50 pointer-events-none' : ''}`}>
                            {mapLocations.map((loc) => (
                                <div key={loc.id} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`loc-${loc.id}`}
                                        checked={useCreateForm.data.map_location_ids?.includes(loc.id) || false}
                                        onCheckedChange={(checked) => {
                                            const current = useCreateForm.data.map_location_ids || [];
                                            if (checked) {
                                                useCreateForm.setData("map_location_ids", [...current, loc.id]);
                                            } else {
                                                useCreateForm.setData("map_location_ids", current.filter((id) => id !== loc.id));
                                            }
                                        }}
                                    />
                                    <Label htmlFor={`loc-${loc.id}`} className="text-sm font-normal cursor-pointer">
                                        {loc.location}{loc.description ? ` - ${loc.description}` : ""}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {useCreateForm.errors.map_location_ids && (
                            <p className="text-red-500 text-xs">
                                {useCreateForm.errors.map_location_ids}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="open_date">Open Date</Label>
                        <Input
                            required
                            id="open_date"
                            name="open_date"
                            value={useCreateForm.data.open_date}
                            onChange={(e) =>
                                useCreateForm.setData("open_date", e.target.value)
                            }
                            type="date"
                            className="w-full block rounded-md p-2"
                        />
                        {useCreateForm.errors.open_date && (
                            <p className="text-red-500 text-xs">
                                {useCreateForm.errors.open_date}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="closing_date">Closing Date</Label>
                        <Input
                            required
                            id="closing_date"
                            name="closing_date"
                            value={useCreateForm.data.closing_date}
                            onChange={(e) =>
                                useCreateForm.setData("closing_date", e.target.value)
                            }
                            type="date"
                            className="w-full block rounded-md p-2"
                        />
                        {useCreateForm.errors.closing_date && (
                            <p className="text-red-500 text-xs">
                                {useCreateForm.errors.closing_date}
                            </p>
                        )}
                    </div>
                    <div className="flex  flex-col  gap-2">
                        <Label htmlFor="is_active">Status</Label>
                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="is_active"
                                name="is_active"
                                checked={useCreateForm.data.is_active}
                                onCheckedChange={(checked) =>
                                    useCreateForm.setData("is_active", checked)
                                }
                            />
                            <Label htmlFor="is_active">Set active</Label>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="no_location">Location Validation</Label>
                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="no_location"
                                name="no_location"
                                checked={useCreateForm.data.no_location}
                                onCheckedChange={(checked) =>
                                    useCreateForm.setData("no_location", checked)
                                }
                            />
                            <Label htmlFor="no_location">No location required (free entry)</Label>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button disabled={loading} type="submit">
                        {loading ? (
                            <div className="flex items-center">
                                <LoaderCircle
                                    size="sm"
                                    color="green"
                                    className="mr-2 animate-spin"
                                />
                                Saving...
                            </div>
                        ) : (
                            "Save"
                        )}
                    </Button>
                </DialogFooter>
            </form>
        );
    };

    const MapCoordinatesModal = ({ map_coordinates }) => {
        const [loading, setLoading] = React.useState(false);
        const [latitude, setLatitude] = React.useState(map_coordinates?.latitude || "");
        const [longitude, setLongitude] = React.useState(map_coordinates?.longitude || "");

        const handleSave = async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
                const coordinates = {
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    saved_at: new Date().toISOString()
                };

                // Save to JSON file via API endpoint
                await axios.post('/api/save-map-coordinates', coordinates)
                    .then(() => {
                        toast.success("Map coordinates saved successfully!");
                        setMapModalOpen(false);
                        setLatitude("");
                        setLongitude("");
                    })
                    .catch((error) => {
                        console.error('Error saving coordinates:', error);
                        toast.error("Failed to save coordinates");
                    });
            } catch (error) {
                console.error('Error:', error);
                toast.error("Failed to save coordinates");
            } finally {
                setLoading(false);
            }
        };

        return (
            <form onSubmit={handleSave}>
                <div className="grid gap-4 mb-4">
                    <div className="grid gap-3">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                            required
                            id="latitude"
                            name="latitude"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            placeholder="Enter latitude"
                            type="number"
                            step="any"
                        />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                            required
                            id="longitude"
                            name="longitude"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            placeholder="Enter longitude"
                            type="number"
                            step="any"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button disabled={loading} type="submit">
                        {loading ? (
                            <div className="flex items-center">
                                <LoaderCircle
                                    size="sm"
                                    color="green"
                                    className="mr-2 animate-spin"
                                />
                                Saving...
                            </div>
                        ) : (
                            "Save Coordinates"
                        )}
                    </Button>
                </DialogFooter>
            </form>
        );
    };

    const MapLocationForm = () => {
        const [loading, setLoading] = React.useState(false);
        const useMapLocationForm = useForm({
            id: "",
            location: "",
            description: "",
            lat: "",
            lng: "",
            open_time: "",
            closing_time: "",
            is_default: false,
            w_map: false,
        });

        useEffect(() => {
            if (selectedMapLocation) {
                useMapLocationForm.setData({
                    id: selectedMapLocation.id,
                    location: selectedMapLocation.location,
                    description: selectedMapLocation.description || "",
                    lat: selectedMapLocation.lat,
                    lng: selectedMapLocation.lng,
                    open_time: selectedMapLocation.open_time ? selectedMapLocation.open_time.slice(0, 5) : "",
                    closing_time: selectedMapLocation.closing_time ? selectedMapLocation.closing_time.slice(0, 5) : "",
                    is_default: !!selectedMapLocation.is_default,
                    w_map: !!selectedMapLocation.w_map,
                });
            }
        }, [selectedMapLocation]);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
                const data = {
                    location: useMapLocationForm.data.location,
                    description: useMapLocationForm.data.description,
                    lat: useMapLocationForm.data.lat ? parseFloat(useMapLocationForm.data.lat) : "",
                    lng: useMapLocationForm.data.lng ? parseFloat(useMapLocationForm.data.lng) : "",
                    open_time: useMapLocationForm.data.open_time || null,
                    closing_time: useMapLocationForm.data.closing_time || null,
                    is_default: useMapLocationForm.data.is_default,
                    w_map: useMapLocationForm.data.w_map,
                };

                if (useMapLocationForm.data.id) {
                    await axios.put(`/api/map-locations/${useMapLocationForm.data.id}`, data);
                    toast.success("Map location updated successfully!");
                } else {
                    await axios.post('/api/map-locations', data);
                    toast.success("Map location created successfully!");
                }

                setMapLocationModalOpen(false);
                setSelectedMapLocation(null);
                useMapLocationForm.reset();
                fetchMapLocations();
            } catch (error) {
                console.error('Error saving map location:', error);
                if (error.response?.data?.errors) {
                    useMapLocationForm.setError(error.response.data.errors);
                }
                toast.error("Failed to save map location");
            } finally {
                setLoading(false);
            }
        };

        return (
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 mb-4">
                    <div className="grid gap-3">
                        <Label htmlFor="location">Location Name</Label>
                        <Input
                            required
                            id="location"
                            name="location"
                            value={useMapLocationForm.data.location}
                            onChange={(e) => useMapLocationForm.setData("location", e.target.value)}
                            placeholder="Enter location name"
                        />
                        {useMapLocationForm.errors.location && (
                            <p className="text-red-500 text-xs">{useMapLocationForm.errors.location}</p>
                        )}
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            name="description"
                            value={useMapLocationForm.data.description}
                            onChange={(e) => useMapLocationForm.setData("description", e.target.value)}
                            placeholder="Enter description (optional)"
                        />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="lat">Latitude</Label>
                        <Input
                            id="lat"
                            name="lat"
                            value={useMapLocationForm.data.lat}
                            onChange={(e) => useMapLocationForm.setData("lat", e.target.value)}
                            placeholder="Enter latitude"
                            type="number"
                            step="any"
                        />
                        {useMapLocationForm.errors.lat && (
                            <p className="text-red-500 text-xs">{useMapLocationForm.errors.lat}</p>
                        )}
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="lng">Longitude</Label>
                        <Input
                            id="lng"
                            name="lng"
                            value={useMapLocationForm.data.lng}
                            onChange={(e) => useMapLocationForm.setData("lng", e.target.value)}
                            placeholder="Enter longitude"
                            type="number"
                            step="any"
                        />
                        {useMapLocationForm.errors.lng && (
                            <p className="text-red-500 text-xs">{useMapLocationForm.errors.lng}</p>
                        )}
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="open_time">Open Time *</Label>
                        <Input
                            id="open_time"
                            name="open_time"
                            value={useMapLocationForm.data.open_time}
                            onChange={(e) => useMapLocationForm.setData("open_time", e.target.value)}
                            type="time"
                            className="w-full block rounded-md p-2"
                            required
                        />
                        <p className="text-xs text-gray-500">Time when the location becomes active daily.</p>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="closing_time">Closing Time *</Label>
                        <Input
                            id="closing_time"
                            name="closing_time"
                            value={useMapLocationForm.data.closing_time}
                            onChange={(e) => useMapLocationForm.setData("closing_time", e.target.value)}
                            type="time"
                            className="w-full block rounded-md p-2"
                            required
                        />
                        <p className="text-xs text-gray-500">Time when the location becomes inactive daily.</p>
                    </div>
                    <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="is_default"
                                checked={!!useMapLocationForm.data.is_default}
                                onCheckedChange={(checked) => useMapLocationForm.setData("is_default", !!checked)}
                            />
                            <Label htmlFor="is_default" className="text-sm font-normal cursor-pointer">
                                Set as default location
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="w_map"
                                checked={!!useMapLocationForm.data.w_map}
                                onCheckedChange={(checked) => useMapLocationForm.setData("w_map", !!checked)}
                            />
                            <Label htmlFor="w_map" className="text-sm font-normal cursor-pointer">
                                Show map on warning
                            </Label>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button disabled={loading} type="submit">
                        {loading ? (
                            <div className="flex items-center">
                                <LoaderCircle
                                    size="sm"
                                    color="green"
                                    className="mr-2 animate-spin"
                                />
                                Saving...
                            </div>
                        ) : (
                            "Save"
                        )}
                    </Button>
                </DialogFooter>
            </form>
        );
    };

    const displayStatus = (attendance) => {
        if (!attendance.is_active) {
            return <Badge variant="secondary">Inactive</Badge>;
        }

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().slice(0, 8);
        const openDate = attendance.open_date;
        const closingDate = attendance.closing_date;
        const mapLocations = attendance.map_locations || [];

        if (!openDate || !closingDate || mapLocations.length === 0) {
            return <Badge variant="secondary" className="bg-gray-400 text-white">No Schedule</Badge>;
        }

        if (today < openDate) {
            return <Badge variant="secondary" className="bg-blue-500 text-white">Scheduled</Badge>;
        }
        if (today > closingDate) {
            return <Badge variant="secondary" className="bg-gray-500 text-white">Closed</Badge>;
        }

        const hasActiveLocation = mapLocations.some((loc) => {
            return loc.open_time && loc.closing_time &&
                currentTime >= loc.open_time && currentTime < loc.closing_time;
        });

        if (!hasActiveLocation) {
            const hasNotOpenYet = mapLocations.some((loc) =>
                loc.open_time && currentTime < loc.open_time
            );
            if (hasNotOpenYet) {
                return <Badge variant="secondary" className="bg-blue-500 text-white">Not Open Yet</Badge>;
            }
            return <Badge variant="secondary" className="bg-gray-500 text-white">Closed</Badge>;
        }

        return (
            <Badge
                variant="secondary"
                className="bg-green-500 text-white dark:bg-green-600"
            >
                <BadgeCheckIcon />
                Active
            </Badge>
        );
    };

    const displayMapLocationStatus = (mapLocation) => {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 8);
        const openTime = mapLocation.open_time;
        const closingTime = mapLocation.closing_time;

        if (!openTime || !closingTime) {
            return <Badge variant="secondary" className="bg-gray-400 text-white">No Schedule</Badge>;
        }

        if (currentTime < openTime) {
            return (
                <Badge variant="secondary" className="bg-blue-500 text-white">
                    Not Open Yet
                </Badge>
            );
        }

        if (currentTime >= closingTime) {
            return (
                <Badge variant="secondary" className="bg-gray-500 text-white">
                    Closed
                </Badge>
            );
        }

        return (
            <Badge
                variant="secondary"
                className="bg-green-500 text-white dark:bg-green-600"
            >
                <BadgeCheckIcon />
                Active
            </Badge>
        );
    };

    const handleDeleteMapLocation = async (id) => {
        if (!confirm("Are you sure you want to delete this map location?")) {
            return;
        }

        try {
            await axios.delete(`/api/map-locations/${id}`);
            toast.success("Map location deleted successfully!");
            fetchMapLocations();
        } catch (error) {
            console.error('Error deleting map location:', error);
            toast.error("Failed to delete map location");
        }
    };

    const isEnabled = (attendance) => {
        if (!attendance.is_active) {
            return false;
        }

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().slice(0, 8);
        const openDate = attendance.open_date;
        const closingDate = attendance.closing_date;
        const mapLocations = attendance.map_locations || [];

        if (!openDate || !closingDate || mapLocations.length === 0) {
            return false;
        }

        if (today < openDate || today > closingDate) {
            return false;
        }

        return mapLocations.some((loc) =>
            loc.open_time && loc.closing_time &&
            currentTime >= loc.open_time && currentTime < loc.closing_time
        );
    };

    return (
        <AppLayout title="Settings" is_admin={is_admin} w_admin={true}>

            <div className="flex flex-col items-start my-5">
                <div className="text-lg font-semibold">Attendance Setting</div>
                <div className="mt-2 text-xs">Manage or create new attendance and map locations</div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                    <TabsTrigger value="attendance">
                        <Calendar className="w-4 h-4 mr-2" />
                        Attendance
                    </TabsTrigger>
                    <TabsTrigger value="map-location">
                        <MapPin className="w-4 h-4 mr-2" />
                        Map Location
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="attendance" className="space-y-4">
                    <div className="mt-5 flex  sm:flex-row flex-col gap-2  md:w-full">
                        <Input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search attendance"
                            size="sm"
                        />

                        <Button
                            onClick={() => {
                                router.get(
                                    "/settings",
                                    { search },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    }
                                );
                            }}
                        >
                            Search
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearch("");
                                router.visit("/settings", {
                                    preserveState: true,
                                    preserveScroll: true,
                                });
                            }}
                        >
                            Reset
                        </Button>

                        <Dialog open={mapModalOpen} onOpenChange={setMapModalOpen}>
                            <DialogTrigger asChild>
                                {/* <Button
                                    variant="outline"
                                    onClick={() => setMapModalOpen(true)}
                                >
                                    Set Map Coordinates
                                </Button> */}
                            </DialogTrigger>
                            <DialogContent
                                className="sm:max-w-[425px]"
                                onInteractOutside={(e) => {
                                    e.preventDefault();
                                }}
                            >
                                <DialogHeader>
                                    <DialogTitle>Set Map Coordinates</DialogTitle>
                                    <DialogDescription>
                                        Enter the latitude and longitude coordinates for the map location.
                                    </DialogDescription>
                                </DialogHeader>
                                <MapCoordinatesModal map_coordinates={map_coordinates} />
                            </DialogContent>
                        </Dialog>

                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="primary"
                                    className={
                                        "bg-blue-900 hover:bg-blue-800 text-white"
                                    }
                                    onClick={() => setSelectedAttendance(null)}
                                >
                                    Create Attendance <Plus className="ml-2 size-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent
                                className="sm:max-w-[425px]"
                                onInteractOutside={(e) => {
                                    e.preventDefault(); // 🚫 prevent closing when clicking outside
                                }}
                            >
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedAttendance ? "Edit " : "Create "}
                                        Attendance
                                    </DialogTitle>
                                    <DialogDescription>
                                        {selectedAttendance
                                            ? "Edit attendance. Click save when you're done."
                                            : "Create a new attendance. Click save when you're done."}
                                    </DialogDescription>
                                </DialogHeader>
                                <CreateAttendance />
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="mt-5  overflow-y-auto max-[600px]:w-[400px] max-[520px]:w-[350px] max-[470px]:w-[300px]  max-[412px]:w-[280px] max-[390px]:w-[auto]">
                        <Table>
                            <TableCaption>List of Attendances</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">
                                        Attendance title
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Locations</TableHead>
                                    <TableHead>Date Range</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendanceList?.data?.map((attendance) => (
                                    <TableRow key={attendance.id}>
                                        <TableCell className="font-medium">
                                            {attendance.title}
                                        </TableCell>
                                        <TableCell>
                                            {displayStatus(attendance)}
                                        </TableCell>
                                        <TableCell>
                                            {attendance.no_location ? (
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">Free Entry</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">Location</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {attendance.no_location ? (
                                                <span className="text-xs text-gray-400">—</span>
                                            ) : (attendance.map_locations || []).length > 0 ? (
                                                <span className="text-xs text-gray-600">
                                                    {attendance.map_locations.map((loc) => loc.location).join(", ")}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    No locations
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {attendance.open_date && attendance.closing_date ? (
                                                <span className="text-xs text-gray-600">
                                                    {attendance.open_date} → {attendance.closing_date}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    Not set
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedAttendance(
                                                            attendance
                                                        );

                                                        setOpen(true);
                                                    }}
                                                >
                                                    <Edit
                                                        size={12}
                                                        className="text-blue-400"
                                                    />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Pagination className="mt-5">
                            <PaginationContent>
                                {attendanceList?.meta?.links?.map((link, key) => {
                                    if (key == 0) {
                                        return (
                                            <PaginationItem
                                                key={key}
                                                className="cursor-pointer"
                                            >
                                                <PaginationPrevious
                                                    href={attendanceList?.links?.prev}
                                                />
                                            </PaginationItem>
                                        );
                                    }

                                    if (
                                        key ==
                                        attendanceList?.meta?.links?.length - 1
                                    ) {
                                        return (
                                            <PaginationItem className="cursor-pointer">
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
                                            >
                                                {link.label}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}

                                {/* <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem> */}
                            </PaginationContent>
                        </Pagination>
                    </div>
                </TabsContent>

                <TabsContent value="map-location" className="space-y-4">
                    <div className="mt-5 flex sm:flex-row flex-col gap-2 md:w-full">
                        <Input
                            type="text"
                            value={mapLocationSearch}
                            onChange={(e) => setMapLocationSearch(e.target.value)}
                            placeholder="Search map locations"
                            size="sm"
                        />

                        <Dialog open={mapLocationModalOpen} onOpenChange={setMapLocationModalOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="primary"
                                    className="bg-blue-900 hover:bg-blue-800 text-white"
                                    onClick={() => setSelectedMapLocation(null)}
                                >
                                    Create Map Location <Plus className="ml-2 size-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent
                                className="sm:max-w-[425px]"
                                onInteractOutside={(e) => {
                                    e.preventDefault();
                                }}
                            >
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedMapLocation ? "Edit " : "Create "}
                                        Map Location
                                    </DialogTitle>
                                    <DialogDescription>
                                        {selectedMapLocation
                                            ? "Edit map location. Click save when you're done."
                                            : "Create a new map location. Click save when you're done."}
                                    </DialogDescription>
                                </DialogHeader>
                                <MapLocationForm />
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="mt-5 overflow-y-auto max-[600px]:w-[400px] max-[520px]:w-[350px] max-[470px]:w-[300px] max-[412px]:w-[280px] max-[390px]:w-[auto]">
                        <Table>
                            <TableCaption>List of Map Locations</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[150px]">Location Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Coordinates</TableHead>
                                    <TableHead>Token</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Default</TableHead>
                                    <TableHead>Map</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mapLocations
                                    .filter((loc) =>
                                        loc.location.toLowerCase().includes(mapLocationSearch.toLowerCase()) ||
                                        (loc.description && loc.description.toLowerCase().includes(mapLocationSearch.toLowerCase()))
                                    )
                                    .map((mapLocation) => (
                                        <TableRow key={mapLocation.id}>
                                            <TableCell className="font-medium">
                                                {mapLocation.location}
                                            </TableCell>
                                            <TableCell>
                                                {mapLocation.description || (
                                                    <span className="text-xs text-gray-400">No description</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs">
                                                    <div>Lat: {mapLocation.lat}</div>
                                                    <div>Lng: {mapLocation.lng}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {mapLocation.token ? (
                                                        <>
                                                            <a
                                                                href={`/?token=${mapLocation.token}`}
                                                                target="_blank"
                                                                className="text-xs text-blue-600 hover:underline font-mono max-w-[140px] truncate inline-block"
                                                            >
                                                                {window.location.origin}/?token={mapLocation.token.slice(0, 8)}...
                                                            </a>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(`${window.location.origin}/?token=${mapLocation.token}`);
                                                                    toast.success("URL copied!");
                                                                }}
                                                                className="text-blue-500 hover:text-blue-700 text-xs"
                                                            >
                                                                Copy URL
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs">
                                                    <div>{mapLocation.open_time || "N/A"}</div>
                                                    <div className="text-gray-400">to {mapLocation.closing_time || "N/A"}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {displayMapLocationStatus(mapLocation)}
                                            </TableCell>
                                            <TableCell>
                                                {mapLocation.is_default ? (
                                                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white text-xs">Default</Badge>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {mapLocation.w_map ? (
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">On</Badge>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedMapLocation(mapLocation);
                                                            setMapLocationModalOpen(true);
                                                        }}
                                                    >
                                                        <Edit size={12} className="text-blue-400" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDeleteMapLocation(mapLocation.id)}
                                                    >
                                                        <Trash size={12} className="text-red-400" />
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
        </AppLayout>
    );
}
