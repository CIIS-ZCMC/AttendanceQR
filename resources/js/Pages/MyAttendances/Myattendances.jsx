import React from "react";
import AppLayout from "@/layouts/app-layout";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
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
import { Check, CheckCircle, Plus } from "lucide-react";
import { useState } from "react";
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
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { router } from "@inertiajs/react";

export default function Myattendances({ attendanceList }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const setSearchValue = (key, value) => {
        setSearch((prev) => ({
            ...prev,
            [key]: typeof value === "object" ? { ...value } : value,
        }));
    };
    return (
        <AppLayout>
            <div className="text-lg font-semibold">MY ATTENDANCES</div>
            <div className="mt-2 text-xs">View your attendance</div>

            <div className="grid grid-cols-12 gap-2 mt-5 max-[600px]:w-[400px] max-[520px]:w-[350px] max-[470px]:w-[300px]  max-[412px]:w-[280px] max-[390px]:w-[auto]">
                <div className="col-span-4 max-[600px]:col-span-12 ">
                    <Input
                        type="number"
                        value={search.employee_id}
                        onChange={(e) =>
                            setSearchValue("employee_id", e.target.value)
                        }
                        placeholder="Employee ID"
                        size="sm"
                        className={"w-full block rounded px-2 py-3"}
                    />
                </div>

                <div className="col-span-4 max-[600px]:col-span-12">
                    <Input
                        type="date"
                        value={search.date}
                        onChange={(e) => setSearchValue("date", e.target.value)}
                        placeholder="Search attendance"
                        size="sm"
                        className="w-full block rounded px-2 py-3"
                    />
                </div>

                <div className="col-span-2 max-[600px]:col-span-6">
                    <Button
                        onClick={() => {
                            router.get(
                                "my-attendance",
                                {
                                    employee_id: search.employee_id,
                                    date: search.date,
                                },
                                {
                                    preserveState: true,
                                    preserveScroll: true,
                                }
                            );
                        }}
                        className="w-full"
                    >
                        Find
                    </Button>
                </div>

                <div className="col-span-2 max-[600px]:col-span-6">
                    <Button
                        variant="outline"
                        onClick={() => {
                            router.visit("my-attendance", {
                                preserveState: false,
                                preserveScroll: true,
                            });
                        }}
                        className="w-full"
                    >
                        Reset
                    </Button>
                </div>
            </div>

            <div className="mt-5  md:w-full">
                <Table>
                    <TableCaption>List of Attendances</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px] text-center text-xs">
                                Attendance title
                            </TableHead>
                            <TableHead className="text-center text-xs">
                                Date - Time
                            </TableHead>
                            <TableHead className="text-center text-xs">
                                Status
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attendanceList?.length == 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className=" h-20 text-xs font-semibold text-red-400 uppercase text-center"
                                >
                                    No attendances found
                                </TableCell>
                            </TableRow>
                        ) : (
                            attendanceList?.map((attendance) => (
                                <TableRow key={attendance.id}>
                                    <TableCell className="font-medium">
                                        {attendance.attendance?.title}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {attendance.first_entry}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant="outline"
                                            className="text-xs text-green-500"
                                        >
                                            Recorded <CheckCircle />
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
