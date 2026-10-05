import React from "react";
import AppLayout from "@/layouts/app-layout";
import {
    Table,
    TableBody,
    TableCell,
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
import { Loader2, Search, RotateCcw, Clock, User, IdCard, MapPin, Calendar } from "lucide-react";

export default function Responses({ is_admin, logs, totalCount: overallTotal }) {
    const [search, setSearch] = React.useState("");
    const [btnLoad, setBtnload] = React.useState(false);

    const formatDateTime = (dateString) => {
        if (!dateString) return { date: "—", time: "—" };
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return { date: dateString, time: "" };

        return {
            date: d.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
            time: d.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
        };
    };

    const displayTotal = overallTotal ?? (logs?.total ?? (logs?.data?.length || 0));

    return (
        <AppLayout is_admin={is_admin} w_admin={true}>
            <div className="w-full max-w-sm sm:max-w-4xl mx-auto space-y-4 py-2 animate-in fade-in duration-300">
                {/* Sticky Header & Search Bar */}
                <div className="sticky top-16 z-40 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md pt-2 pb-3 -mx-2 px-2 sm:-mx-4 sm:px-4 space-y-3 border-b border-slate-200/60 dark:border-slate-800/60">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                Attendance Logs & Responses
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Real-time employee submissions and records
                            </p>
                        </div>

                        <div className="px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-bold border border-blue-200 dark:border-blue-800 shadow-sm shrink-0">
                            {displayTotal.toLocaleString()} {displayTotal === 1 ? "Record" : "Total Records"}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <form
                        method="GET"
                        className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-md space-y-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            setBtnload(true);
                            router.visit("/responses?search=" + encodeURIComponent(search), {
                                preserveState: true,
                                preserveScroll: true,
                                onFinish: () => setBtnload(false),
                            });
                        }}
                    >
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <Input
                                type="text"
                                name="search"
                                placeholder="Search by Employee ID or Name"
                                className="pl-10 h-12 text-sm rounded-xl"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs active:scale-95 shadow-sm"
                                disabled={btnLoad}
                            >
                                {btnLoad ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <span>Searching...</span>
                                    </>
                                ) : (
                                    <>
                                        <Search className="mr-1.5 h-3.5 w-3.5" />
                                        <span>Find</span>
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                    router.visit("/responses");
                                    setSearch("");
                                }}
                                className="h-11 px-4 rounded-xl text-xs active:scale-95 border-slate-300"
                            >
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                <span>Reset</span>
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Mobile Cards Feed (phones) */}
                <div className="block sm:hidden space-y-2.5">
                    {logs?.data?.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center text-xs text-rose-500 font-bold border border-slate-200">
                            No logs found matching your search.
                        </div>
                    ) : (
                        logs?.data?.map((log, key) => {
                            const { date: formattedDate, time: formattedTime } = formatDateTime(log.first_entry);
                            return (
                                <div
                                    key={key}
                                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md border border-blue-200">
                                            ID: {log.employee_profile?.employee_id || "N/A"}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                {formattedDate}
                                            </span>
                                            {formattedTime && (
                                                <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    {formattedTime}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span>{log.name || "Unknown Name"}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                            {log.map_location?.location || (log.area ? `${log.area}` : "No Location")}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Desktop/Tablet Table (sm+) */}
                <div className="hidden sm:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                <TableHead className="w-[120px] font-bold">Employee ID</TableHead>
                                <TableHead className="font-bold">Name</TableHead>
                                <TableHead className="font-bold">Location</TableHead>
                                <TableHead className="font-bold">Date & Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs?.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        className="text-center font-bold text-rose-500 py-8"
                                        colSpan={4}
                                    >
                                        No logs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs?.data?.map((log, key) => {
                                    const { date: formattedDate, time: formattedTime } = formatDateTime(log.first_entry);
                                    return (
                                        <TableRow key={key}>
                                            <TableCell className="font-mono font-medium">
                                                {log.employee_profile?.employee_id || "—"}
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                                                {log.name}
                                            </TableCell>
                                            <TableCell>
                                                {log.map_location?.location ? (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                                                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                                        <span title={log.map_location.description || log.map_location.location}>
                                                            {log.map_location.location}
                                                        </span>
                                                    </div>
                                                ) : log.area ? (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                                                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span>{log.area}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">No Location</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-slate-700 dark:text-slate-300 text-xs">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {formattedTime}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                                        {formattedDate}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {logs?.links?.length > 3 && (
                    <div className="py-2 flex justify-center">
                        <Pagination>
                            <PaginationContent className="flex-wrap justify-center gap-1">
                                {logs?.links?.map((link, key) => {
                                    if (key === 0) {
                                        return (
                                            <PaginationItem key={key}>
                                                <PaginationPrevious href={logs?.prev_page_url} />
                                            </PaginationItem>
                                        );
                                    }

                                    if (key === logs?.links?.length - 1) {
                                        return (
                                            <PaginationItem key={key}>
                                                <PaginationNext href={logs?.next_page_url} />
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
            </div>
        </AppLayout>
    );
}
