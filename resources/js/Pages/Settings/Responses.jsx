import React, { useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/Components/ui/input";
import { router } from "@inertiajs/react";
import { Loader2 } from "lucide-react";

export default function Responses({ is_admin, logs }) {
    const [search, setSearch] = React.useState("");
    const [btnLoad, setBtnload] = React.useState(false);

    return (
        <AppLayout is_admin={is_admin} w_admin={true}>
            <div className="flex flex-col items-start my-5">
                <div className="text-lg font-semibold">
                    Attendance Responses
                </div>
                <div className="mt-2 text-xs">Viewing Attendance Responses</div>
            </div>
            <form
                method="GET"
                className="w-full"
                onSubmit={(e) => {
                    e.preventDefault();
                    setBtnload(true);
                    router.visit("/responses?search=" + search, {
                        preserveState: true,
                        preserveScroll: true,
                        onSuccess: (page) => {
                            setBtnload(false);
                        },
                    });
                }}
            >
                <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-3 w-full">
                    <Input
                        type="text"
                        name="search"
                        placeholder="Search Employee"
                        className="w-full sm:flex-1"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button
                        type="submit"
                        className="w-full sm:w-auto"
                        disabled={btnLoad}
                    >
                        {btnLoad ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                Finding ..
                            </>
                        ) : (
                            "Find"
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                            router.visit("/responses");
                            setSearch("");
                        }}
                        className="w-full sm:w-auto"
                    >
                        Reset
                    </Button>
                </div>
            </form>

            <div className="mt-5  overflow-y-auto max-[600px]:w-[400px] max-[520px]:w-[350px] max-[470px]:w-[300px]  max-[412px]:w-[280px] max-[390px]:w-[auto]">
                <Table>
                    <TableCaption>List of Attendances</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">
                                EmployeeID
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Date-Time ( entry )</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs?.data?.map((log, key) => (
                            <TableRow key={key}>
                                <TableCell className="font-medium">
                                    {log.employee_profile?.employee_id}
                                </TableCell>
                                <TableCell>{log.name}</TableCell>
                                <TableCell>{log.first_entry}</TableCell>
                            </TableRow>
                        ))}{" "}
                        {logs?.data?.length == 0 && (
                            <TableRow>
                                <TableCell
                                    className="text-center font-medium font-bold text-red-400"
                                    colSpan={3}
                                >
                                    No logs found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <Pagination className="mt-5">
                    <PaginationContent>
                        {logs?.links?.map((link, key) => {
                            if (key == 0) {
                                return (
                                    <PaginationItem
                                        key={key}
                                        className="cursor-pointer"
                                    >
                                        <PaginationPrevious
                                            href={logs?.prev_page_url}
                                        />
                                    </PaginationItem>
                                );
                            }

                            if (key == logs?.links?.length - 1) {
                                return (
                                    <PaginationItem className="cursor-pointer">
                                        <PaginationNext
                                            href={logs?.next_page_url}
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
                    </PaginationContent>
                </Pagination>
            </div>
        </AppLayout>
    );
}
