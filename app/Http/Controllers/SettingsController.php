<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use Inertia\Inertia;
use App\Http\Resources\AttendanceResource;

class SettingsController extends Controller
{
    public function index()
    {
        $attendanceList = AttendanceResource::collection(Attendance::orderBy("created_at", "desc")->paginate(3));
        return Inertia::render("Settings/Settings", [
            "attendanceList" => $attendanceList,
        ]);
    }
}
