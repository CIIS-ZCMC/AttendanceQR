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
import { Loader2, Search, RotateCcw, Clock, User, IdCard } from "lucide-react";

export default function Responses({ is_admin, logs }) {
    const [search, setSearch] = React.useState("");
    const [btnLoad, setBtnload] = React.useState(false);

    return (
        <AppLayout is_admin={is_admin} w_admin={true}>
            <div className="w-full max-w-sm sm:max-w-2xl mx-auto space-y-4 py-2 animate-in fade-in duration-300">
                <div className="flex flex-col items-start">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Attendance Logs & Responses
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Real-time employee submissions and records
                    </p>
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

                {/* Mobile Cards Feed (phones) */}
                <div className="block sm:hidden space-y-2.5">
                    {logs?.data?.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center text-xs text-rose-500 font-bold border border-slate-200">
                            No logs found matching your search.
                        </div>
                    ) : (
                        logs?.data?.map((log, key) => (
                            <div
                                key={key}
                                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md border border-blue-200">
                                        ID: {log.employee_profile?.employee_id || "N/A"}
                                    </span>
                                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        {log.first_entry}
                                    </span>
                                </div>
                                <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span>{log.name || "Unknown Name"}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop/Tablet Table (sm+) */}
                <div className="hidden sm:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                <TableHead className="w-[120px] font-bold">Employee ID</TableHead>
                                <TableHead className="font-bold">Name</TableHead>
                                <TableHead className="font-bold">Entry Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs?.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        className="text-center font-bold text-rose-500 py-8"
                                        colSpan={3}
                                    >
                                        No logs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs?.data?.map((log, key) => (
                                    <TableRow key={key}>
                                        <TableCell className="font-mono font-medium">
                                            {log.employee_profile?.employee_id || "—"}
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                                            {log.name}
                                        </TableCell>
                                        <TableCell className="text-slate-600 text-xs font-mono">
                                            {log.first_entry}
                                        </TableCell>
                                    </TableRow>
                                ))
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
