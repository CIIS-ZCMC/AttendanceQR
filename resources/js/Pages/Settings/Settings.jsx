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
export default function Settings({ attendanceList }) {
    const [selectedAttendance, setSelectedAttendance] = React.useState(null);
    const CreateAttendance = () => {
        return (
            <form>
                <div className="grid gap-4 mb-4">
                    <div className="grid gap-3">
                        <Label htmlFor="name-1">Title</Label>
                        <Input required id="name-1" name="name" />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="username-1">Closing At</Label>
                        <Input
                            required
                            id="closing-at-1"
                            name="closing-at"
                            type="datetime-local"
                            className="w-full block rounded-md p-2"
                        />
                    </div>
                    <div className="flex  flex-col  gap-2">
                        <Label htmlFor="is_active">Status</Label>
                        <div className="flex items-center gap-3">
                            <Checkbox id="is_active" />
                            <Label htmlFor="is_active">Set active</Label>
                        </div>

                        <div className="flex items-center gap-3">
                            <Checkbox id="is_open" />
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
                    <Button type="submit">Save</Button>
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
        return false;
    };

    console.log(attendanceList);
    return (
        <AppLayout title="Settings">
            <div className="text-lg font-semibold">Attendance Settings</div>
            <div className="mt-2 text-xs">Manage or create new attendance</div>

            <div className="mt-5 flex  sm:flex-row flex-col gap-2 max-[400px]:w-65 max-[500px]:w-[80%]  max-[639px]:w-[90%] md:w-full">
                <Input type="text" placeholder="Search attendance" size="sm" />

                <Button>Search</Button>
                <Button variant="outline">Reset</Button>

                <Dialog>
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="space-y-4"
                    >
                        <DialogTrigger asChild>
                            <Button
                                variant="primary"
                                className={
                                    "bg-blue-900 hover:bg-blue-800 text-white"
                                }
                            >
                                Create Attendance{" "}
                                <Plus className="ml-2 size-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create Attendance</DialogTitle>
                                <DialogDescription>
                                    Create a new attendance. Click save when
                                    you&apos;re done.
                                </DialogDescription>
                            </DialogHeader>
                            <CreateAttendance />
                        </DialogContent>
                    </form>
                </Dialog>
            </div>
            <div className="mt-5 max-[400px]:w-65 max-[500px]:w-[80%]  max-[639px]:w-[90%] md:w-full">
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
                                Created At
                            </TableHead>
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
                                    {attendance.created_at}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            //disabled={!isEnabled(attendance)}
                                            className={`${
                                                !isEnabled(attendance)
                                                    ? "hidden"
                                                    : ""
                                            }`}
                                            onClick={() => {
                                                console.log(attendance);
                                                setSelectedAttendance(
                                                    attendance
                                                );
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
                        {console.log(attendanceList?.meta)}

                        {attendanceList?.meta?.links?.map((link, key) => {
                            if (key == 0) {
                                return (
                                    <PaginationItem className="cursor-pointer">
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
