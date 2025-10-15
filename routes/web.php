<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\GoogleController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware([
   \App\Http\Middleware\SessionMiddleware::class,
])->group(function () {
   Route::controller(AttendanceController::class)->group(function () {
      Route::get("/", "index");
      Route::post("/store_attendance", "store")->name("store_attendance");
      Route::get("my-attendance", "myAttendance")->name("my-attendance");
      Route::get("validate-location", "validateLocation")->name("validate-location");
   });


   Route::controller(SettingsController::class)->group(function () {
      Route::get("/settings", "index")->name("index.settings");
      Route::get("/active-configuration", "activeConfiguration")->name("active-configuration");
      Route::post("/store_attendance/settings", "store")->name("store_attendance.settings");
      Route::post("/update-active", "updateActive")->name("update-active");
      Route::get("/responses", "attendanceResponses")->name("responses");
   });

   Route::controller(GoogleController::class)->group(function () {
      Route::get("/auth/google", "redirectToGoogle")->name("auth.google");
      Route::get("/auth/google/callback", "handleGoogleCallback")->name("auth.google.callback");
   });
});
