<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttendanceStoreRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Attendance;
use App\Models\Attendance_Information;
use App\Models\Contact;
use App\Models\EmployeeProfile;
use Illuminate\Support\Facades\Log;

class AttendanceController extends Controller
{
    public function validateLocation(Request $request)
    {
        $geofenceCenter = ['lat' => 6.905891, 'lng' => 122.080778];
        $geofenceRadius = 40; // meters

        $userLat = $request->lat;
        $userLng = $request->lng;

        $userLat = 6.905835;
        $userLng = 122.080778;

        /**
         * Add Validation here soon , that active attendance does not need location based.
         * 
         */

        return response()->json([
            'isInLocation' => $this->checkGeofence($userLat, $userLng, $geofenceCenter['lat'], $geofenceCenter['lng'], $geofenceRadius)['isInLocation'] ?? false,
            'ip_address' => $request->ip(),
            'distance' => $this->checkGeofence($userLat, $userLng, $geofenceCenter['lat'], $geofenceCenter['lng'], $geofenceRadius)['distance'] - $geofenceRadius,
            'radius' => $this->checkGeofence($userLat, $userLng, $geofenceCenter['lat'], $geofenceCenter['lng'], $geofenceRadius)['radius']
        ]);
    }

    public function checkGeofence($userLat, $userLng, $centerLat, $centerLng, $radiusMeters = 50)
    {
        $earthRadius = 6371000; // meters

        $latFrom = deg2rad($userLat);
        $lngFrom = deg2rad($userLng);
        $latTo   = deg2rad($centerLat);
        $lngTo   = deg2rad($centerLng);

        $latDelta = $latTo - $latFrom;
        $lngDelta = $lngTo - $lngFrom;

        $a = sin($latDelta / 2) ** 2 +
            cos($latFrom) * cos($latTo) *
            sin($lngDelta / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        $distance = $earthRadius * $c;

        return [
            'isInLocation' => $distance <= $radiusMeters,
            'distance' => $distance,
            'radius' => $radiusMeters
        ];
    }


    public function index(Request $request)
    {
        $attendance_key = $request->key ?? Attendance::where("is_active", true)->first()?->attendance_key;

        $attendance = Attendance::where("attendance_key", $attendance_key)->where("is_active", true)->first();

        //session()->forget("userToken");
        if (!session()->has("userToken")) {
            return Inertia::render("Scan/Welcome");
        }

        $status = null;
        if (!$attendance) {
            $status['notFound'] = true;
        } elseif (!$attendance->is_open) {
            $status['isNotOpen'] = true;
        } elseif ($attendance->closed_at <= now()) {
            $status['isClosed'] = true;
        }

        $userToken = session()->get('userToken')['id'] ?? $request->fingerprint;

        $userInformation = session()->get('userToken');

        $contact = Contact::where("email_address", $userInformation['email'])->first();
        $UserName = $userInformation['name'];
        $employeeID = null;
        $email = $userInformation['email'];
        $profilePhoto = $userInformation['avatar'];
        if ($contact) {
            $personalInformation = $contact->personalInformation;
            $fullName = $personalInformation->fullName();
            $employeeProfile = $personalInformation->employeeProfile;

            $employeeID = $employeeProfile->employee_id;
            $UserName = $personalInformation->fullName();
        }




        $userToken = $userToken . ($attendance->id ?? -1);
        $attendanceInformation = Attendance_Information::where('userToken', $userToken)
            ->where('attendances_id', $attendance->id ?? -1)
            ->first();


        if ($attendanceInformation) {
            $status['isRecorded'] = true;
        }

        return Inertia::render('Scan/Scan', [
            'invalid_status' => $status,
            'attendance' => $attendance,
            "session" => session()->get('session'),
            'ip' => $request->ip(),
            'employeeID' => $employeeID,
            'email' => $email,
            'profilePhoto' => $profilePhoto,
            'UserName' => $UserName
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


            $Existing = Attendance_Information::where('userToken', $attendanceInformation['userToken'])
                ->where('attendances_id', $attendanceInformation['attendances_id'])
                ->first();
            if ($Existing) {
                if ((int)$Existing->biometric_id !== (int)$attendanceInformation['biometric_id']) {
                    Log::channel('customLog')->warning("Attendance ID : " . $attendanceInformation['attendances_id'] . " | Employee : " . $Existing->name . " with BiometricID : " . $Existing->biometric_id . " is trying to register for " . $attendanceInformation['name'] . " with BiometricID : " . $attendanceInformation['biometric_id']);
                    return redirect()->back()->with('session', [
                        'message' => 'Registering for other employee is highly prohibited. This action is recorded — do it again and this ID of yours will be reported to HR.',
                        'type' => 'warning-anomaly',
                    ]);
                }
            }

            Attendance_Information::firstOrCreate([
                "userToken" => $attendanceInformation['userToken'],
                "attendances_id" => $attendanceInformation['attendances_id'],
            ], $attendanceInformation);

            MailController::SendReceipt(new Request([
                'email' => $attendanceInformation['email'],
                'name' => $attendanceInformation['name'],
                'subject' => 'UMIS - Geofencing Attendance Acknowledgement Receipt',
                'attendance_id' => $attendanceInformation['attendances_id'],
                'date' => date("F d, Y", strtotime($attendanceInformation['first_entry'])),
                'time_in' => date("h:i A", strtotime($attendanceInformation['first_entry'])),
                'employee_id' => $attendanceInformation['employee_id'],
            ]));
            return redirect()->back();
        } catch (\Exception $e) {
            return $e;
        }
    }


    public function myAttendance(Request $request)
    {
        $date = $request->date ?? null;
        $employee_id = $request->employee_id ?? session()->get("employeeID");
        $biometric_id = null;
        $Employee = EmployeeProfile::where("employee_id", $employee_id)->first();
        $attendance = [];

        if ($Employee) {
            $biometric_id = $Employee->biometric_id;
        }

        if ($date && $biometric_id) {
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
