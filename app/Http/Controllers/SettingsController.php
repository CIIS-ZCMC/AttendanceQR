<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use Inertia\Inertia;
use App\Http\Resources\AttendanceResource;
use App\Exceptions\ValidationHandler;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use App\Http\Requests\SettingsAttendanceStoreRequest;
use App\Models\Attendance_Information;

class SettingsController extends Controller
{

    public function ValidateLogin($redirect)
    {
        $adminAccounts = json_decode(file_get_contents(base_path("Admin_Accounts.json")));

        if (!session()->has("admin_user")) {
            if (request()->has("employeeId")) {

                if (in_array(request("employeeId"), $adminAccounts->admin_accounts)) {
                    session()->put("admin_user", true);
                    session()->forget("error");
                    return to_route($redirect);
                }
                session()->put("error", "Access Denied");
                return to_route($redirect);
            }
        }
    }


    public function index()
    {
        //session()->forget("admin_user");
        $this->ValidateLogin("index.settings");

        $attendanceList = AttendanceResource::collection(Attendance::with('mapLocations')->orderBy("created_at", "desc")->paginate(5));

        if (request()->has("search") && $search = request("search")) {
            $attendanceList = AttendanceResource::collection(Attendance::with('mapLocations')->where("title", "like", "%{$search}%")->orderBy("created_at", "desc")->paginate(5));
        }

        $map_coordinates = [];
        $data  = [];

        $file = storage_path('app/map_coordinates.json');
        if (!file_exists($file)) {
            $map_coordinates = [
                'lat' => 6.907257,
                'lng' => 122.080909,
            ];
        } else {
            $data = json_decode(file_get_contents($file), true);
            if (isset($data[0])) {
                $map_coordinates = $data[0];
            }
        }

        $mapLocations = \App\Models\MapLocation::orderBy('created_at', 'desc')->get();

        return Inertia::render("Settings/Settings", [
            "attendanceList" => $attendanceList,
            "is_admin" => session()->has("admin_user"),
            "error" => session()->get("error") ?? false,
            "map_coordinates" => $map_coordinates,
            "mapLocations" => $mapLocations,
        ]);
    }

    public function activeConfiguration()
    {

        $this->ValidateLogin("active-configuration");

        $attendance = Attendance::with('mapLocations')->where("is_active", true)->first();
        $allMapLocations = \App\Models\MapLocation::all();

        return Inertia::render("Settings/ActiveConfiguration", [
            "attendance" => $attendance,
            "mapLocations" => $allMapLocations,
            "is_admin" => session()->has("admin_user"),
            "error" => session()->get("error") ?? false,
        ]);
    }

    public function store(SettingsAttendanceStoreRequest $request)
    {

        if ($request->is_active) {
            Attendance::where("is_active", true)->update([
                "is_active" => false,
            ]);
        }
        if ($request->id) {
            $attendance = Attendance::where("id", $request->id)->first();
            $attendance->update([
                "title" => $request->name,
                "is_active" => $request->is_active,
                "open_date" => $request->open_date,
                "closing_date" => $request->closing_date,
                "no_location" => $request->boolean('no_location'),
            ]);
            if (!$request->boolean('no_location') && is_array($request->map_location_ids)) {
                $attendance->mapLocations()->sync($request->map_location_ids);
            }
            return to_route("index.settings");
        }
        $concattedName = $request->name . "-" . date("Y_m_d") . "_" . time();
        $attendance = Attendance::create([
            "title" => $concattedName,
            "is_active" => $request->is_active,
            "open_date" => $request->open_date,
            "closing_date" => $request->closing_date,
            "no_location" => $request->boolean('no_location'),
        ]);
        if (!$request->boolean('no_location') && is_array($request->map_location_ids)) {
            $attendance->mapLocations()->sync($request->map_location_ids);
        }

        return to_route("index.settings");
    }

    public function updateActive(Request $request)
    {
        $attendance = Attendance::where("id", $request->id)->first();
        if ($attendance) {
            $attendance->update([
                "is_active" => true,
                "open_date" => $request->open_date,
                "closing_date" => $request->closing_date,
            ]);

            if ($request->map_location_id) {
                $mapLocation = $attendance->mapLocations()->where('maplocation.id', $request->map_location_id)->first();
                if ($mapLocation) {
                    $mapLocation->update([
                        'open_time' => $request->open_time,
                        'closing_time' => $request->closing_time,
                    ]);
                }
            }
        }
        return to_route("active-configuration");
    }

    public function attendanceResponses()
    {

        $this->ValidateLogin("responses");

        $attendance = Attendance::where("is_active", true)->first();

        if (!$attendance) {
            return Inertia::render("Settings/Responses", [
                "is_admin" => session()->has("admin_user"),
                "error" => session()->get("error") ?? false,
                "logs" => collect()->paginate(50),
            ]);
        }

        $logs = $attendance->logs()->with("employeeProfile")->paginate(50);

        if (request()->has('search') && ($search = request('search'))) {

            $logs = Attendance_Information::where('attendances_id', $attendance->id)
                ->whereIn('biometric_id', function ($query) use ($search) {
                    $query->select('biometric_id')
                        ->from('employee_profiles')
                        ->where('employee_id', 'like', "%{$search}%")
                        ->orWhereIn('personal_information_id', function ($subQuery) use ($search) {
                            $subQuery->select('id')
                                ->from('personal_informations')
                                ->where('last_name', 'like', "%{$search}%")
                                ->orWhere('first_name', 'like', "%{$search}%");
                        });
                })->with("employeeProfile")
                ->paginate(50);
        } else {
            $logs = $attendance->logs()
                ->with('employeeProfile.personalInformation')
                ->paginate(50);
        }


        return Inertia::render("Settings/Responses", [
            "is_admin" => session()->has("admin_user"),
            "error" => session()->get("error") ?? false,
            "logs" => $logs,
        ]);
    }
}
