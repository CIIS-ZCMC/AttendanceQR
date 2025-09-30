import React, { useEffect } from "react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import warning from "../../src/warning.gif";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/Components/ui/checkbox";
import { useForm } from "@inertiajs/react";
import { AlertOctagon, LoaderCircle } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ActiveConfiguration({ attendance }) {
    const useCreateForm = useForm({
        id: "",
        name: "",
        closing_at: "",
        is_active: false,
        is_open: false,
    });

    useEffect(() => {
        if (attendance) {
            useCreateForm.setData({
                id: attendance.id,
                name: attendance.title,
                closing_at: attendance.closed_at,
                is_active: attendance.is_active,
                is_open: attendance.is_open,
            });
        }
    }, [attendance]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await useCreateForm.post("/update-active", {
            onSuccess: () => {
                toast.success("Attendance updated successfully");
            },
            onError: () => {
                toast.error("Attendance update failed");
            },
        });
    };

    return (
        <AppLayout title="Active Configuration">
            <div className="mt-4 flex justify-center items-center md:absolute md:top-80 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2">
                <div className="flex items-center justify-center min-h-[50vh]">
                    {!attendance ? (
                        <div className="flex items-center justify-center min-h-[50vh]">
                            <Card className="w-full max-w-md shadow-md border border-gray-200">
                                <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                                    <AlertCircle className="w-10 h-10 text-red-500" />
                                    <h2 className="text-md font-semibold text-gray-800">
                                        No Attendance Found
                                    </h2>
                                    <p className="text-xs text-gray-500 text-center">
                                        It looks like no attendance records are
                                        available for this link.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-center min-h-[50vh]">
                                <Card className="w-full max-w-md shadow-md border border-gray-20 max-[2000px]:w-[500px] min-[1500px]:w-[500px] max-[576px]:w-[400px] max-[526px]:w-[350px] max-[476px]:w-[300px] max-[426px]:w-[260px] max-[376px]:w-[240px]">
                                    <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                                        <AlertOctagon className="w-10 h-10 text-green-500" />
                                        <h2 className="text-md font-semibold text-gray-800">
                                            Attendance Found
                                        </h2>
                                        <Label
                                            htmlFor="username-1"
                                            className="text-left text-sm font-semibold text-gray-800"
                                        >
                                            Closing At
                                        </Label>
                                        <Input
                                            required
                                            id="closing-at-1"
                                            name="closing_at"
                                            onChange={(e) =>
                                                useCreateForm.setData(
                                                    "closing_at",
                                                    e.target.value
                                                )
                                            }
                                            type="datetime-local"
                                            value={
                                                useCreateForm.data.closing_at
                                            }
                                            className="w-full block rounded-md p-2"
                                            // min={minValue}
                                        />

                                        <div className="flex  flex-block  gap-2 mt-5">
                                            <Label htmlFor="is_active">
                                                Status :
                                            </Label>

                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    id="is_open"
                                                    name="is_open"
                                                    checked={
                                                        useCreateForm.data
                                                            .is_open
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        useCreateForm.setData(
                                                            "is_open",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <Label htmlFor="is_open">
                                                    Open
                                                </Label>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={useCreateForm.processing}
                                            type="submit"
                                            className="w-full mt-5"
                                        >
                                            {useCreateForm.processing ? (
                                                <>
                                                    <LoaderCircle className=" h-4 w-4 animate-spin" />
                                                    Saving Configuration...
                                                </>
                                            ) : (
                                                "Save"
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
