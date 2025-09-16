<?php

use App\Http\Controllers\AttendanceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::controller(AttendanceController::class)->group(function () {
   Route::get("/{attendance_key?}", "index")->where('attendance_key', '.*');
});
