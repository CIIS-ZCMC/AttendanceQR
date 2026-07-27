<?php

namespace App\Http\Controllers;

use App\Models\AttendanceSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AttendanceScheduleController extends Controller
{
    public function index()
    {
        $schedules = AttendanceSchedule::orderBy('created_at', 'desc')->get();
        return response()->json($schedules, 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'open_time' => 'required|date_format:H:i',
            'closing_time' => 'required|date_format:H:i|after:open_time',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $schedule = AttendanceSchedule::create([
            'name' => $request->name,
            'open_time' => $request->open_time,
            'closing_time' => $request->closing_time,
        ]);

        return response()->json($schedule, 201);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'open_time' => 'required|date_format:H:i',
            'closing_time' => 'required|date_format:H:i|after:open_time',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $schedule = AttendanceSchedule::find($id);

        if (!$schedule) {
            return response()->json(['message' => 'Schedule not found'], 404);
        }

        $schedule->update([
            'name' => $request->name,
            'open_time' => $request->open_time,
            'closing_time' => $request->closing_time,
        ]);

        return response()->json($schedule, 200);
    }

    public function destroy($id)
    {
        $schedule = AttendanceSchedule::find($id);

        if (!$schedule) {
            return response()->json(['message' => 'Schedule not found'], 404);
        }

        $schedule->delete();

        return response()->json(['message' => 'Schedule deleted successfully'], 200);
    }
}
