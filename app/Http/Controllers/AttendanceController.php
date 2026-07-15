<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttendanceStoreRequest;
use App\Models\AssignArea;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Attendance;
use App\Models\Attendance_Information;
use App\Models\AttendanceAnomaly;
use App\Models\Contact;
use App\Models\EmployeeProfile;
use App\Models\Notifications;
use App\Models\UserNotifications;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AttendanceController extends Controller
{

    public function calibrate()
    {
        $mapLocations = \App\Models\MapLocation::orderBy('location', 'asc')->get();
        return Inertia::render("Scan/Calibrate", [
            "mapLocations" => $mapLocations,
        ]);
    }

    public function saveMapCoordinates(Request $request)
    {
        $coordinates = $request->all();

        // Save to JSON file
        $file = storage_path('app/map_coordinates.json');
        $data = [];

        if (file_exists($file)) {
            $data = json_decode(file_get_contents($file), true);
        }

        // Update the first coordinate entry or create new one
        if (!empty($data)) {
            // Update existing coordinates (replace first entry)
            $data[0] = $coordinates;
        } else {
            // Add new coordinates
            $data[] = $coordinates;
        }

        file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));

        return response()->json([
            'message' => 'Map coordinates saved successfully!'
        ], 200);
    }
    public function validateLocation(Request $request)
    {

        $token = $request->query('token');

        if (!$token) {
            return response()->json([
                'message' => 'No attendance location token provided.'
            ], 404);
        }

        $mapLocation = \App\Models\MapLocation::active()->where('token', $token)->first();
        if (!$mapLocation) {
            return response()->json([
                'message' => 'Location is not active or has expired.'
            ], 404);
        }
        $geofenceCenter = ['lat' => $mapLocation->lat, 'lng' => $mapLocation->lng];
        $geofenceRadius = 30;

        $userLat = $request->lat;
        $userLng = $request->lng;

        $accuracy = $request->accuracy ?? 0;

        $Saved = false;

        // $userLat = 6.906935;
        // $userLng = 122.081535;

        /**
         * Add Validation here soon , that active attendance does not need location based.
         *
         */

        $results = $this->checkGeofence($userLat, $userLng, $geofenceCenter['lat'], $geofenceCenter['lng'], $accuracy, $geofenceRadius);
        if ($results['isInLocation']) {
            // $this->store(new AttendanceStoreRequest([
            //     "employeeId" => "Finder_Via_Token",
            //     "is_finder" => true
            // ]));

            $Saved = true;
            session()->put("reloaded", true);
        }

        return response()->json([
            'isInLocation' => $results['isInLocation'] ?? false,
            'ip_address' => $request->ip(),
            'distance' =>  $results['distance'] - $geofenceRadius,
            'radius' => $results['radius'],
            'saved' => session('session.type') === 'success',
            'saved_direct' => $Saved,
            'isSuspicious' => $results['isSuspicious'] ?? false,
        ]);
    }

    public function checkGeofence($userLat, $userLng, $centerLat, $centerLng, $accuracy, $radiusMeters = 50)
    {
        $earthRadius = 6371000; // meters

        $isSuspicious = false;

        // Red Flag: If accuracy is reported as 0 or exactly 1, 
        // it's almost certainly a mock location.
        if ($accuracy <= 1) {
            $isSuspicious = true;
        }

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
            'radius' => $radiusMeters,
            'isSuspicious' => $isSuspicious
        ];
    }


    public function isActiveAttendance($attendanceID)
    {

        if (empty($attendanceID)) {
            return false;
        }

        $attendance = Attendance::where("id", $attendanceID)->where("is_active", 1)->first();
        if (!$attendance || $attendance->mapLocations->isEmpty()) {
            return false;
        }

        $now = now();
        $today = $now->toDateString();
        $currentTime = $now->format('H:i:s');

        if (!$attendance->open_date || !$attendance->closing_date) {
            return false;
        }
        if ($today < $attendance->open_date || $today > $attendance->closing_date) {
            return false;
        }

        foreach ($attendance->mapLocations as $mapLocation) {
            if ($mapLocation->open_time && $mapLocation->closing_time
                && $currentTime >= $mapLocation->open_time && $currentTime < $mapLocation->closing_time) {
                return true;
            }
        }

        return false;
    }



    public function index(Request $request)
    {

        if (!session()->has("userToken")) {
            return Inertia::render("Scan/Welcome", [
                'mapToken' => $request->query('token'),
            ]);
        }

        $token = $request->query('token');

        if ($token) {
            session()->put('activeMapToken', $token);
            $activeMapLocation = \App\Models\MapLocation::where('token', $token)->first();
        } else {
            $activeMapLocation = \App\Models\MapLocation::where('is_default', true)->first();
        }

        if (!$activeMapLocation) {
            return Inertia::render('Scan/NoLocation');
        }

        $now = now();
        $today = $now->toDateString();
        $currentTime = $now->format('H:i:s');
        $status = null;

        $attendance = Attendance::where("is_active", true)
            ->whereHas('mapLocations', function ($query) use ($activeMapLocation) {
                $query->where('maplocation.id', $activeMapLocation->id);
            })
            ->first();

        if (!$attendance) {
            $status['notFound'] = true;
        } else {
            if (!$attendance->open_date || !$attendance->closing_date) {
                $status['notFound'] = true;
            } elseif ($today < $attendance->open_date) {
                $status['isNotOpen'] = true;
            } elseif ($today > $attendance->closing_date) {
                $status['isClosed'] = true;
            } elseif (!$activeMapLocation->open_time || !$activeMapLocation->closing_time) {
                $status['notFound'] = true;
            } elseif ($currentTime < $activeMapLocation->open_time) {
                $status['isNotOpen'] = true;
            } elseif ($currentTime >= $activeMapLocation->closing_time) {
                $status['isClosed'] = true;
            }
        }

        $userToken = session()->get('userToken')['id'] ?? $request->fingerprint;
        if ($attendance) {
            session()->put("activeAttendanceID", $attendance->id);
        }
        $userInformation = session()->get('userToken');
        $employeeID = null;

        $contact = Contact::where("email_address", $userInformation['email'])->first();


        $UserName = $userInformation['name'];
        $fullName = null;

        $email = $userInformation['email'];
        $profilePhoto = $userInformation['avatar'];
        if ($contact) {
            $personalInformation = $contact->personalInformation;
            $fullName = $personalInformation->fullName();
            $employeeProfile = $personalInformation->employeeProfile;

            $employeeID = $employeeProfile->employee_id;

        }


        $userToken = $userToken . ($attendance->id ?? -1);
        $attendanceInformation = Attendance_Information::where('userToken', $userToken)
            ->where('attendances_id', $attendance->id ?? -1)
            ->first();

        if ($attendanceInformation) {
            $status['isRecorded'] = true;
        } else {
            session()->forget("isRecorded");
        }

        if (session()->has("isRecorded")) {
            $status['isRecorded'] = true;
        }

        $showWarning = !session()->has('warning_seen');

        if ($showWarning) {
            session()->put('warning_seen', true);
        }

        return Inertia::render('Scan/Scan', [
            'invalid_status' => $status,
            'attendance' => $attendance,
            "session" => session()->get('session'),
            'ip' => $request->ip(),
            'isRecorded' => $status['isRecorded'] ?? session()->get('isRecorded'),
            'employeeID' => $employeeID,
            'reload' => session()->get('reloaded')  ?? false,
            'email' => $email,
            'profilePhoto' => $profilePhoto,
            'UserName' => $UserName,
            'googleName' => session()->get('userToken')['name'] ?? null,
            'warningSession' => $showWarning,
            'activeMapLocation' => $activeMapLocation,
            'mapToken' => $token,
        ]);
    }


    public function store(AttendanceStoreRequest $request)
    {
        try {

       
            if (isset($request->is_no_employee_id) && $request->is_no_employee_id) {

                $request->validate([
                    "name" => "required",
                    "area" => "required",
                ]);
                return $this->SaveNoEmployeeID($request->UserNoEmployeeID($request->name, $request->area));
            }

            $attendanceInformation = $request->userAttendanceInformation();

          

            if (empty($attendanceInformation)  || empty($attendanceInformation['name'])) {
                return redirect()->back()->with("session", [
                    "message" => "Employee not found",
                    "type" => "error"
                ]);
            }



            if (!$this->isActiveAttendance($attendanceInformation['attendances_id'])) {
                return redirect()->back()->with("session", [
                    "message" => "Attendance record failed",
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


            if ($request->isSuspicious()) {
                AttendanceAnomaly::firstOrCreate([
                    "name" => $attendanceInformation['name'],
                    "employee_id" => $attendanceInformation['employee_id'],
                    "attendance_id" => $attendanceInformation['attendances_id']
                ], [
                    "date_time" => now(),
                ]);
            }

            $attendanceDate = Carbon::parse($attendanceInformation['first_entry'])->format("M j,Y");

            $notification =  Notifications::firstOrCreate([
                'title' => "Attendance Receipt",
                'description' => "Your flag ceremony attendance made at " . $attendanceDate . " has been successfully recorded. Click here to view your attendance record.",
                'module_path' => "/attendance/notification",
            ]);

            UserNotifications::firstOrCreate(
                [
                    'notification_id' => $notification->id,
                    'employee_profile_id' => $attendanceInformation['profile_id'],
                ],
                [
                    'seen' => 0,
                ]
            );

            // MailController::SendReceipt(new Request([
            //     'email' => $attendanceInformation['email'],
            //     'name' => $attendanceInformation['name'],
            //     'subject' => 'UMIS - Geofencing Attendance Acknowledgement Receipt',
            //     'attendance_id' => $attendanceInformation['attendances_id'],
            //     'date' => date("F d, Y", strtotime($attendanceInformation['first_entry'])),
            //     'time_in' => date("h:i A", strtotime($attendanceInformation['first_entry'])),
            //     'employee_id' => $attendanceInformation['employee_id'],
            // ]));

            return redirect()->back()->with('session', [
                'message' => 'Attendance recorded successfully.',
                'type' => 'success',
            ]);
        } catch (\Exception $e) {


            return $e;
        }
    }

    public function getSummary(AttendanceStoreRequest $request)
    {
        try {
            if (!isset($request->employeeId) || empty($request->employeeId)) {
                return redirect()->back()->with("session", [
                    "message" => "Employee ID is required",
                    "type" => "error"
                ]);
            }

            $attendanceInformation = $request->userAttendanceInformation();

            if (empty($attendanceInformation) || empty($attendanceInformation['name'])) {
                return redirect()->back()->with("session", [
                    "message" => "Employee not found. Please check your employee ID and try again.",
                    "type" => "error"
                ]);
            }

            // Process the attendance information here
            // For now, just return a success response
            return redirect()->back()->with("session", [
                "message" => "Attendance summary retrieved successfully",
                "type" => "success",
                "data" => $attendanceInformation
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with("session", [
                "message" => "Unable to verify employee ID. Please try again.",
                "type" => "error"
            ]);
        }
    }


    public function SaveNoEmployeeID($data)
    {

        $attendanceInformation = $data;

        Attendance_Information::firstOrCreate([
            "userToken" => $attendanceInformation['userToken'],
            "attendances_id" => $attendanceInformation['attendances_id'],
        ], $attendanceInformation);

        session()->put("isRecorded", true);

        return redirect()->back()->with('success', [
            'message' => 'Attendance recorded successfully.',
            'type' => 'success',
        ]);
    }


    public function myAttendance(Request $request)
    {
        $date = $request->date ?? null;

        $biometric_id = null;
        $userInformation = session()->get('userToken');
        $employeeID = $request->employee_id ?? null;

        if (!$userInformation) {
            return redirect()->route('login');
        }

        $contact = Contact::where("email_address", $userInformation['email'])->first();
        $UserName = $userInformation['name'];
        $Employee = null;
        $email = $userInformation['email'];
        $profilePhoto = $userInformation['avatar'];
        if ($contact) {
            $personalInformation = $contact->personalInformation;
            $fullName = $personalInformation->fullName();
            $employeeProfile = $personalInformation->employeeProfile;

            $employeeID = $employeeProfile->employee_id;
            $UserName = $personalInformation->fullName();
            $Employee = $employeeProfile;
        }







        $attendance = [];

        if ($Employee) {
            $biometric_id = $Employee->biometric_id;
        }

        if (!$Employee && !empty($request->employee_id)) {
            $biometric_id = EmployeeProfile::firstWhere("employee_id", $request->employee_id)->biometric_id;
        }


        $from = date("Y-m-d H:i:s", strtotime("-3 months"));
        $to = date("Y-m-d H:i:s");

        $attendance = Attendance_Information::where("biometric_id", $biometric_id)
            ->whereBetween("first_entry", [$from, $to])
            ->with("attendance")
            ->get();

        if ($date && $biometric_id) {
            $attendance = Attendance_Information::where("biometric_id", $biometric_id)
                ->whereDate("first_entry", $date)
                ->with("attendance")
                ->get();
        }

        return Inertia::render('MyAttendances/Myattendances', [
            'attendanceList' => !$employeeID ? [] : $attendance,
            'employeeID' => $employeeID
        ]);
    }

    public function scannedSave($employee_id)
    {
        $employee = EmployeeProfile::where('employee_id', $employee_id)->first();

        if (!$employee) {
            return response()->json([
                "message" => "Employee not found",
            ], 404);
        }

        $email = $employee->GetPersonalInfo()->contact->email_address;
        $areaDetails = $employee->assignedArea->findDetails()['details'];
        $sector = $employee->assignedArea->findDetails()['sector'] ?? null;

        $activeAttendance = Attendance::where("is_active", true)->first();


        if (!$this->isActiveAttendance($activeAttendance->id)) {
            return response()->json([
                "message" => "Attendance session is not currently active.",
            ], 403);
        }

        Attendance_Information::firstOrCreate([
            'attendances_id' => $activeAttendance->id,
            'biometric_id' => $employee->biometric_id,
        ], [
            'name' => $employee->name,
            'area' => $areaDetails->name,
            'areacode' => $areaDetails->code,
            'sector' => $sector,
            'first_entry' => date("Y-m-d H:i:s"),
            'last_entry' => null,
            'userToken' => null,
            'email' => $email,
            'profile_id' => $employee->id,
        ]);

        return response()->json([
            "message" => "Attendance recorded successfully!",
        ], 202);
    }
}
