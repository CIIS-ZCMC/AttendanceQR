<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $attendanceList = Attendance::paginate(3);
        return Inertia::render("Settings/Settings", [
            "attendanceList" => $attendanceList,
        ]);
    }
}
