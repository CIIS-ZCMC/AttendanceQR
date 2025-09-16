import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoaderPinwheel } from "lucide-react";

export const AttrSkeleton = () => {
    return (
        <div
            style={{
                position: "absolute",
                top: "45%",
                left: "55%",
                transform: "translate(-50%, -50%)",
                width: "100%",
            }}
        >
            <div className="flex flex-col items-center justify-center">
                <LoaderPinwheel
                    size={50}
                    color="green"
                    className="animate-spin"
                />
                <span className="text-xs font-bold mt-2 text-gray-400 ">
                    UMIS-Attendance Logger
                </span>
            </div>
        </div>
    );
};
