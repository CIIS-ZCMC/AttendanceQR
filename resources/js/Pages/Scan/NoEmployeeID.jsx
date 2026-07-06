import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import React, { useEffect } from 'react'

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '@/Components/ui/button'

export default function NoEmployeeID({ googleName, setNoEmployeeID, handleSaveNoEmployeeID, setData, data }) {
    useEffect(() => {
        setData({ ...data, name: googleName, is_no_employee_id: true })
    }, [googleName])
    return (
        <div className="text-center">
            <Button type="button" variant={"outline"} className="mb-4" onClick={() => {
                setNoEmployeeID(false);
                setData({ ...data, name: null, area: null, is_no_employee_id: false })
            }}>
                Back
            </Button>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-sm mx-auto">
                {/* <h2 className="text-lg font-semibold text-yellow-800 mb-3">
                    This feature is currently unavailable.
                </h2> */}
            <p className="text-sm font-medium text-yellow-700">
                You must register a UMIS account to use the Attendance QR. <br /><br />
                Please visit the IMISS office located at:<br />
              <br />
                <span className="text-yellow-900">Tower 1 Building, Ground Floor</span><br />
                <span className="text-yellow-600">(Near the main entrance)</span><br /><br />
                Our staff will assist you with biometric registration and account setup.<br /><br />
                As soon as registration is done, we'll log your attendance for the day.
            </p>
            </div>

            {/* Previous form design - currently disabled
            <form onSubmit={handleSaveNoEmployeeID}>
                <Button type="button" variant={"outline"} className="mb-4" onClick={() => {
                    setNoEmployeeID(false);
                    setData({ ...data, name: null, area: null, is_no_employee_id: false })
                }}>
                    Back
                </Button>
                <Label>
                    Enter Full Name
                </Label>
                <Input name="name" required value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className={"mt-4 mb-3 shadow-lg  "} />
                <Label className={"mb-2"}>
                    Assigned Area
                </Label>
                <Input name="area" required autoFocus value={data.area} onChange={(e) => setData({ ...data, area: e.target.value })} className={"mt-4 mb-3 shadow-lg  "} />
                <Button type="submit" className="mb-4 w-full">
                    Submit
                </Button>
            </form>
            */}
        </div>
    )
}
