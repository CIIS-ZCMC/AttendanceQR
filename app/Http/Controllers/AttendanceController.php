<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttendanceStoreRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Attendance;
use App\Models\Attendance_Information;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
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

        $userToken = session()->get('userToken');
        $attendanceInformation = Attendance_Information::where('userToken', $userToken)->first();


        if ($attendanceInformation) {
            $status['isRecorded'] = true;
        }


        return Inertia::render('Scan/Scan', [
            'invalid_status' => $status,
            'attendance' => $attendance,
            "session" => session()->get('session')
        ]);
    }


    public function store(AttendanceStoreRequest $request)
    {
        try {
            $attendanceInformation = $request->userAttendanceInformation();

            if (!$attendanceInformation) {
                return redirect()->back()->with("session", [
                    "message" => "Employee not found",
                    "type" => "error"
                ]);
            }

            Attendance_Information::create($attendanceInformation);
            return redirect()->back();
        } catch (\Exception $e) {
            return $e;
        }
    }
}
