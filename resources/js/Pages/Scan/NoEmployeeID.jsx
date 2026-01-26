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
        setData({ ...data, name: googleName })
    }, [googleName])
    return (
        <div>
            <form onSubmit={handleSaveNoEmployeeID}>
                <Button type="button" variant={"outline"} className="mb-4" onClick={() => setNoEmployeeID(false)}>
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

        </div>
    )
}
