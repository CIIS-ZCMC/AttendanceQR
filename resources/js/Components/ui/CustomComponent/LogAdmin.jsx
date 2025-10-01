import React, { useEffect } from "react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Input } from "../input";
import { Button } from "../button";
import { Contact } from "lucide-react";
import { usePage } from "@inertiajs/react";

export default function LogAdmin() {
    return (
        <div className="mt-4 flex flex-col items-center ">
            <Contact className="w-20 h-20 text-gray-500" />
            <form className="flex items-center gap-4 justify-center max-[440px]:flex-col   p-6">
                <Input
                    required
                    placeholder="Enter Employee ID"
                    type="number"
                    name="employeeId"
                    className="w-full border border-gray-200 rounded-md p-2"
                />
                <Button
                    type="submit"
                    className="bg-primary max-[440px]:w-full rounded-md px-4 py-2 text-white hover:bg-primary-dark"
                >
                    Log In
                </Button>
            </form>
        </div>
    );
}
