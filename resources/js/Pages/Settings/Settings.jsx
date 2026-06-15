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
import { Edit, Plus } from "lucide-react";
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
            closing_at: "",
            is_active: false,
            is_open: false,
        });

        useEffect(() => {
            if (selectedAttendance) {
                useCreateForm.setData({
                    id: selectedAttendance.id,
                    name: selectedAttendance.title,
                    closing_at: selectedAttendance.closing_at,
                    is_active: selectedAttendance.is_active,
                    is_open: selectedAttendance.is_open,
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
                        <Label htmlFor="username-1">Closing At</Label>
                        <Input
                            required
                            id="closing-at-1"
                            name="closing_at"
                            value={useCreateForm.data.closing_at}
                            onChange={(e) =>
                                useCreateForm.setData(
                                    "closing_at",
                                    e.target.value
                                )
                            }
                            type="datetime-local"
                            className="w-full block rounded-md p-2"
                        // min={minValue}
                        />
                        {useCreateForm.errors.closing_at && (
                            <p className="text-red-500 text-xs">
                                {useCreateForm.errors.closing_at}
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

                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="is_open"
                                name="is_open"
                                checked={useCreateForm.data.is_open}
                                onCheckedChange={(checked) =>
                                    useCreateForm.setData("is_open", checked)
                                }
                            />
                            <Label htmlFor="is_open">Set open</Label>
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
            is_active: false,
        });

        useEffect(() => {
            if (selectedMapLocation) {
                useMapLocationForm.setData({
                    id: selectedMapLocation.id,
                    location: selectedMapLocation.location,
                    description: selectedMapLocation.description || "",
                    lat: selectedMapLocation.lat,
                    lng: selectedMapLocation.lng,
                    is_active: selectedMapLocation.is_active,
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
                    lat: parseFloat(useMapLocationForm.data.lat),
                    lng: parseFloat(useMapLocationForm.data.lng),
                    is_active: useMapLocationForm.data.is_active,
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
                            required
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
                            required
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
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="is_active">Status</Label>
                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="is_active"
                                name="is_active"
                                checked={useMapLocationForm.data.is_active}
                                onCheckedChange={(checked) => useMapLocationForm.setData("is_active", checked)}
                            />
                            <Label htmlFor="is_active">Set as active location for attendance</Label>
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
        const closingAt = new Date(attendance.closing_at);
        const now = new Date();
        if (attendance.is_active) {
            //check if its open
            if (attendance.is_open) {
                if (now < closingAt) {
                    return (
                        <Badge
                            variant="secondary"
                            className="bg-green-500 text-white dark:bg-green-600"
                        >
                            <BadgeCheckIcon />
                            Active
                        </Badge>
                    );
                }
            } else {
                return <Badge className="bg-gray-500 text-white">Locked</Badge>;
            }
        }
        return <Badge variant="secondary">Closed</Badge>;
    };

    const displayMapLocationStatus = (mapLocation) => {
        if (mapLocation.is_active) {
            return (
                <Badge
                    variant="secondary"
                    className="bg-green-500 text-white dark:bg-green-600"
                >
                    <BadgeCheckIcon />
                    Active
                </Badge>
            );
        }
        return <Badge variant="secondary">Inactive</Badge>;
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

    const handleSetActiveMapLocation = async (id) => {
        try {
            await axios.post(`/api/map-locations/${id}/set-active`);
            toast.success("Map location set as active!");
            fetchMapLocations();
        } catch (error) {
            console.error('Error setting active map location:', error);
            toast.error("Failed to set active map location");
        }
    };
    const isEnabled = (attendance) => {
        const closingAt = new Date(attendance.closing_at);
        const now = new Date();
        if (attendance.is_active) {
            //check if its open
            if (attendance.is_open) {
                if (now < closingAt) {
                    return true;
                }
            } else {
                return true;
            }
        }

        if (attendance.closing_at && attendance.closing_at >= now) {
            return true;
        }

        return false;
    };

    return (
        <AppLayout title="Settings" is_admin={is_admin} w_admin={true}>

            <div className="flex flex-col items-start my-5">
                <div className="text-lg font-semibold">Attendance Setting</div>
                <div className="mt-2 text-xs">Manage or create new attendance</div>
            </div>

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
                            <TableHead>Closing At</TableHead>

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
                                    {attendance.closed_at ?? (
                                        <>
                                            <span className="text-xs text-gray-400">
                                                Not Available
                                            </span>
                                        </>
                                    )}{" "}
                                </TableCell>

                                <TableCell className="text-right">
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            //disabled={!isEnabled(attendance)}
                                            className={`${!isEnabled(attendance)
                                                ? "hidden"
                                                : ""
                                                }`}
                                            onClick={() => {
                                                console.log(attendance);
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

            <div className="flex flex-col items-start my-5 mt-10">
                <div className="text-lg font-semibold">Map Location Settings</div>
                <div className="mt-2 text-xs">Manage map locations for attendance</div>
            </div>

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
                            <TableHead>Status</TableHead>
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
                                        {displayMapLocationStatus(mapLocation)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            {!mapLocation.is_active && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleSetActiveMapLocation(mapLocation.id)}
                                                >
                                                    Set Active
                                                </Button>
                                            )}
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
        </AppLayout>
    );
}
