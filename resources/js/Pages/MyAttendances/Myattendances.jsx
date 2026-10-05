import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { router } from "@inertiajs/react";
import {
    CheckCircle,
    Calendar,
    Clock,
    Search,
    RotateCcw,
    IdCard,
    Filter,
    CalendarDays,
    FileSpreadsheet,
    MapPin,
    User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { attendanceContants } from "@/constants/contants";

export default function Myattendances({ attendanceList, employeeID, employeeName, isOtherEmployee, selectedDate }) {
    const [search, setSearch] = useState({
        employee_id: employeeID || "",
        date: selectedDate || "",
    });

    const { header, description, recorded, noAttendances } = attendanceContants;

    const sortedAttendanceList = useMemo(() => {
        return [...(attendanceList || [])].sort((a, b) => {
            const timeA = new Date(a.first_entry || a.created_at || 0).getTime();
            const timeB = new Date(b.first_entry || b.created_at || 0).getTime();
            if (timeB !== timeA) {
                return timeB - timeA;
            }
            return (b.id || 0) - (a.id || 0);
        });
    }, [attendanceList]);

    useEffect(() => {
        setSearch((prev) => ({
            ...prev,
            employee_id: employeeID || prev.employee_id,
            date: selectedDate !== undefined ? (selectedDate || "") : prev.date,
        }));
    }, [employeeID, selectedDate]);

    const handleSearch = (e) => {
        e?.preventDefault();
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
    };

    const handleReset = () => {
        setSearch({
            employee_id: employeeID || "",
            date: "",
        });
        router.visit("my-attendance", {
            preserveState: false,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <div className="w-full max-w-sm sm:max-w-md mx-auto space-y-4 py-1 animate-in fade-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {header}
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Official personal check-in history
                        </p>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                        {attendanceList?.length || 0} {attendanceList?.length === 1 ? "Log" : "Logs"}
                    </div>
                </div>

                {/* Search & Filter Card */}
                <form
                    onSubmit={handleSearch}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-md space-y-3"
                >
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <Filter className="w-3.5 h-3.5 text-blue-500" />
                        <span>Filter Records</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="relative">
                            <IdCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={search.employee_id}
                                onChange={(e) =>
                                    setSearch((prev) => ({
                                        ...prev,
                                        employee_id: e.target.value,
                                    }))
                                }
                                placeholder="Employee ID"
                                className="pl-9 h-11 text-xs rounded-xl font-mono"
                            />
                        </div>

                        <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input
                                type="date"
                                value={search.date}
                                onChange={(e) =>
                                    setSearch((prev) => ({
                                        ...prev,
                                        date: e.target.value,
                                    }))
                                }
                                className="pl-9 h-11 text-xs rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                        <Button
                            type="submit"
                            className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs active:scale-95 shadow-sm"
                        >
                            <Search className="w-3.5 h-3.5 mr-1.5" />
                            <span>Filter</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            className="h-11 px-4 rounded-xl text-xs active:scale-95 border-slate-300"
                        >
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                            <span>Reset</span>
                        </Button>
                    </div>
                </form>

                {/* Attendance Feed / Mobile Cards */}
                <div className="space-y-3">
                    {/* Searched Employee Info Banner (when searching another employee) */}
                    {isOtherEmployee && employeeID && (
                        <div className="bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl p-3 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-3 shadow-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {employeeName || "Employee Record"}
                                    </div>
                                    <div className="text-[11px] font-mono text-blue-700 dark:text-blue-300">
                                        ID: {employeeID}
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 shrink-0">
                                Searched User
                            </span>
                        </div>
                    )}

                    {attendanceList?.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                                <CalendarDays className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {noAttendances}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    No records match your selected filter.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                className="text-xs rounded-xl"
                            >
                                Clear filters
                            </Button>
                        </div>
                    ) : (
                        sortedAttendanceList.map((item) => {
                            const entryDate = new Date(item.first_entry);
                            const formattedDate = entryDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            });
                            const formattedTime = entryDate.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            });

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 active:scale-[0.99] transition-all"
                                >
                                    {/* Left: Time and Date */}
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                                            <Clock className="w-4 h-4 mb-0.5" />
                                            <span className="text-[10px] font-bold uppercase leading-none">
                                                IN
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div
                                                className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate leading-tight"
                                                title={item.attendance?.title || "Attendance Log"}
                                            >
                                                {item.attendance?.title || "Attendance Log"}
                                            </div>
                                            {isOtherEmployee && (item.name || employeeName) && (
                                                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                                                    <User className="w-3 h-3 text-slate-400 shrink-0" />
                                                    <span className="truncate">{item.name || employeeName}</span>
                                                </div>
                                            )}
                                            <div className="font-mono text-base font-extrabold text-blue-600 dark:text-blue-400 leading-tight mt-0.5">
                                                {formattedTime}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span className="truncate">{formattedDate}</span>
                                            </div>
                                            {item.map_location?.location && (
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                                                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                                    <span className="truncate" title={item.map_location.description || item.map_location.location}>
                                                        {item.map_location.location}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Status Pill */}
                                    <div className="shrink-0">
                                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            <span>{recorded}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
