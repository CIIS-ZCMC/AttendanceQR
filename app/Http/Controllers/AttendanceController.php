<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttendanceStoreRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Attendance;
use App\Models\Attendance_Information;
use App\Models\EmployeeProfile;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $attendance_key = $request->key ?? Attendance::where("is_active", true)->first()?->attendance_key;

        $attendance = Attendance::where("attendance_key", $attendance_key)->where("is_active", true)->first();

        $status = null;
        if (!$attendance) {
            $status['notFound'] = true;
        } elseif (!$attendance->is_open) {
            $status['isNotOpen'] = true;
        } elseif ($attendance->closed_at <= now()) {
            $status['isClosed'] = true;
        }

        $userToken = session()->get('userToken') . session()->get("employeeID");
        $attendanceInformation = Attendance_Information::where('userToken', $userToken)
            ->where('attendances_id', $attendance->id ?? -1)
            ->first();


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


    public function myAttendance(Request $request)
    {
        $date = $request->date ?? null;
        $employee_id = $request->employee_id ?? session()->get("employeeID");

        $Employee = EmployeeProfile::where("employee_id", $employee_id)->first();
        $biometric_id = $Employee->biometric_id;

        $attendance = [];

        if ($date) {
            $attendance = Attendance_Information::where("biometric_id", $biometric_id)
                ->whereDate("first_entry", $date)
                ->with("attendance")
                ->get();
        }

        return Inertia::render('MyAttendances/Myattendances', [
            'attendanceList' => $attendance
        ]);
    }
}
