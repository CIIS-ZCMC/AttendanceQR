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
import { Plus } from "lucide-react";
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
import { Label } from "@/components/ui/label";

export default function Settings({ attendanceList }) {
    const CreateAttendance = () => {
        return (
            <div className="grid gap-4">
                <div className="grid gap-3">
                    <Label htmlFor="name-1">Name</Label>
                    <Input required id="name-1" name="name" />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="username-1">Username</Label>
                    <Input required id="username-1" name="username" />
                </div>
            </div>
        );
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
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
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
                                <TableCell>statss</TableCell>
                                <TableCell>{attendance.closing_at}</TableCell>
                                <TableCell className="text-right">
                                    {attendance.created_at}
                                </TableCell>
                                <TableCell className="text-right">
                                    Actions
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Pagination className="mt-5">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" isActive>
                                2
                            </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#" />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </AppLayout>
    );
}
