import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Building2, Fingerprint, Clock, ArrowLeft, LoaderCircle } from 'lucide-react'

export default function Summary({ employeeID, processing, data, setData, showSummary, setShowSummary, handleSubmitAttendance }) {
    // Fallback for initials
    const initials = showSummary?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'NA';

    const handleBack = () => {
        setShowSummary(null);
        setData({
            ...data,
            employeeId: employeeID,
            area: null,
            is_no_employee_id: false,
        });
    };

    if (!showSummary) return null;

    return (
        <div className="max-w-1xl mt-15 mx-auto p-4">
            <Button
                variant="ghost"
                size="sm"
                className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
                onClick={handleBack}
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </Button>

            <Card className="overflow-hidden border-t-4 border-t-primary">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">

                    <div className="flex flex-col">
                        <CardTitle className="text-2xl font-bold mt-2">{showSummary.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                            <Badge variant="secondary" className="font-mono mt-2">
                                ID: {showSummary.employee_id}
                            </Badge>
                            <Badge variant="outline" className="mt-2">{showSummary.sector}</Badge>
                        </CardDescription>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="grid gap-6 p-6">


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                        {/* Area Info */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Building2 className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Area</p>
                                <p className="text-sm font-medium">{showSummary.area}</p>
                                <p className="text-xs text-muted-foreground italic">{showSummary.areacode}</p>
                            </div>
                        </div>

                        {/* Email Info */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Mail className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Email Address</p>
                                <p className="text-sm font-medium">{showSummary.email}</p>
                            </div>
                        </div>

                        {/* Biometric Info */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Fingerprint className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Biometric ID</p>
                                <p className="text-sm font-medium">#{showSummary.biometric_id}</p>
                            </div>
                        </div>

                        {/* Entry Info */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Clock className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Time</p>
                                <p className="text-sm font-medium">
                                    {new Date(showSummary.first_entry).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="bg-muted/30 flex justify-between items-center py-3 px-6">
                    <span className="text-xs text-muted-foreground">Profile ID: {showSummary.profile_id}</span>
                    <span className="text-xs text-muted-foreground">Attendance ID: {showSummary.attendances_id}</span>
                </CardFooter>

                <Button className={"p-6"} onClick={() => {
                    handleSubmitAttendance();
                }} disabled={processing}>
                    {processing ? (
                        <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />{" "}
                            Submitting
                        </>
                    ) : (
                        "SUBMIT ATTENDANCE"
                    )}
                </Button>
            </Card>
        </div>
    )
}