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

export default function Settings({ attendanceList, is_admin }) {
    const [selectedAttendance, setSelectedAttendance] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const page = usePage();
    const [search, setSearch] = React.useState("");



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
                    toast.success("Attendance created successfully");
                    router.reload({
                        preserveState: true,
                        preserveScroll: true,
                    });
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
                <div className="text-lg font-semibold">Attendance Settings</div>
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
        </AppLayout>
    );
}
