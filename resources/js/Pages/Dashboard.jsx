import React, { useState, useEffect } from 'react'
import AppLayout from '../layouts/app-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapIcon, MapPin } from 'lucide-react'
import mappin from "../src/mappin.gif"
export default function Dashboard() {
  const [serverTime, setServerTime] = useState(new Date().toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'}));
  const [serverDate, setServerDate] = useState(new Date().toLocaleDateString([], {year: 'numeric', month: 'long', day: 'numeric'}));

  useEffect(() => {
    const interval = setInterval(() => {
      setServerTime(new Date().toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'}));
      setServerDate(new Date().toLocaleDateString([], {year: 'numeric', month: 'long', day: 'numeric'}));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
    return (
        <AppLayout>
          <h3 className="text-lg font-bold">Mark Attendance</h3>
<h6 className="text-xs">Enter Employee ID to record attendance</h6>

<span className="text-xs" data-live="server-time">
  Server Time : <br /> <span className="text-gray-500 text-lg font-bold" data-live-update>{serverTime} | {serverDate}</span>
</span>

<div className='absolute top-65 left-1/2 transform -translate-x-1/2 -translate-y-1/2 '>
<span className="text-xs text-blue-600 mt-20 flex items-center">
  Attendance can be logged — you are inside the allowed area. <img src={mappin} alt=""   width="40px" height="40px"/>
</span>

<br/>
<br/>
<span className='text-sm'>Enter employee ID : <br/> <span className='text-gray-500'>(e.g 2022090251)</span></span>
<form action="">
<Input type="number" required placeholder="Employee ID"  className={"mt-4 mb-3"}/>
<Button type="submit">Submit</Button>
</form>
</div>

        </AppLayout>
    )
}
