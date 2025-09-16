<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Attendance;
use App\Models\Attendance_Information;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        //hello_world_attendance
        $attendance_key = $request->key ?? -1;
        $attendance = Attendance::where("attendance_key", $attendance_key)->first();
        $status = null;
        if (!$attendance) {
            $status['notFound'] = true;
        } elseif (!$attendance->is_active) {
            $status['isNotActive'] = true;
        } elseif ($attendance->closed_at <= now()) {
            $status['isClosed'] = true;
        }
        return Inertia::render('Scan/Scan', [
            'invalid_status' => $status,
            'attendance' => $attendance
        ]);
    }
}
