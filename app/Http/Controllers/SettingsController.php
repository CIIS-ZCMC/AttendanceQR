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

class SettingsController extends Controller
{
    public function index()
    {


        $attendanceList = AttendanceResource::collection(Attendance::orderBy("created_at", "desc")->paginate(5));

        if (request()->has("search") && $search = request("search")) {
            $attendanceList = AttendanceResource::collection(Attendance::where("title", "like", "%{$search}%")->orderBy("created_at", "desc")->paginate(5));
        }

        return Inertia::render("Settings/Settings", [
            "attendanceList" => $attendanceList,
        ]);
    }

    public function activeConfiguration()
    {

        $attendance = Attendance::where("is_active", true)->first();

        return Inertia::render("Settings/ActiveConfiguration", [
            "attendance" => $attendance,
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
}
