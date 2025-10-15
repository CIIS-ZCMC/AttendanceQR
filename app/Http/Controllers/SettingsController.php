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
use Illuminate\Support\Facades\DB;
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

        $attendanceList = AttendanceResource::collection(Attendance::orderBy("created_at", "desc")->paginate(5));

        if (request()->has("search") && $search = request("search")) {
            $attendanceList = AttendanceResource::collection(Attendance::where("title", "like", "%{$search}%")->orderBy("created_at", "desc")->paginate(5));
        }

        return Inertia::render("Settings/Settings", [
            "attendanceList" => $attendanceList,
            "is_admin" => session()->has("admin_user"),
            "error" => session()->get("error") ?? false,
        ]);
    }

    public function activeConfiguration()
    {

        $this->ValidateLogin("active-configuration");

        $attendance = Attendance::where("is_active", true)->first();

        return Inertia::render("Settings/ActiveConfiguration", [
            "attendance" => $attendance,
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
            Attendance::where("id", $request->id)->update([
                "title" => $request->name,
                "closed_at" => $request->closing_at,
                "is_active" => $request->is_active,
                "is_open" => $request->is_open,
            ]);
            return to_route("index.settings");
        }
        $concattedName = $request->name . "-" . date("Y_m_d") . "_" . time();
        Attendance::create([
            "title" => $concattedName,
            "closed_at" => $request->closing_at,
            "is_active" => $request->is_active,
            "is_open" => $request->is_open,
        ]);

        return to_route("index.settings");
    }

    public function updateActive(Request $request)
    {


        Attendance::where("id", $request->id)->update([
            "is_active" => true,
            'is_open' => $request->is_open,
            'closed_at' => $request->closing_at
        ]);
        return to_route("active-configuration");
    }

    public function attendanceResponses()
    {

        $this->ValidateLogin("responses");

        $attendance = Attendance::where("is_active", true)->first();



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
