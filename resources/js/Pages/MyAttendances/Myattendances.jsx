import { useState } from "react";

import AppLayout from "@/layouts/app-layout";
import { router } from "@inertiajs/react";
import { CheckCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// assets & constants
import { attendanceContants } from "@/constants/contants";

export default function Myattendances({ attendanceList }) {

    const [search, setSearch] = useState("");

    const {
        header,
        description,
        tableCaption,
        tableTitle,
        tableDateTime,
        tableStatus,
        noAttendances,
        recorded
    } = attendanceContants;

    const setSearchValue = (key, value) => {
        setSearch((prev) => ({
            ...prev,
            [key]: typeof value === "object" ? { ...value } : value,
        }));
    };
    return (
        <AppLayout>

            <div className="flex flex-col items-start my-5">
                <div className="text-lg font-semibold">{header}</div>
                <div className="text-xs">{description}</div>
            </div>

            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-4">
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

                <div className="col-span-12 md:col-span-4">
                    <Input
                        type="date"
                        value={search.date}
                        onChange={(e) => setSearchValue("date", e.target.value)}
                        placeholder="Search attendance"
                        size="sm"
                        className="w-full block rounded px-2 py-3"
                    />
                </div>

                <div className="col-span-12 md:col-span-2">
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

                <div className="col-span-12 md:col-span-2">
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

            <div className="mt-5 overflow-y-auto max-[600px]:w-[400px] max-[520px]:w-[350px] max-[470px]:w-[300px] max-[412px]:w-[280px] max-[390px]:w-[auto]">
                <Table>
                    <TableCaption>{tableCaption}</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className=" text-center text-xs">
                                {tableTitle}
                            </TableHead>
                            <TableHead className="text-center text-xs">
                                {tableDateTime}
                            </TableHead>
                            <TableHead className="text-center text-xs">
                                {tableStatus}
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
                                    {noAttendances}
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
                                            {recorded} <CheckCircle />
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
