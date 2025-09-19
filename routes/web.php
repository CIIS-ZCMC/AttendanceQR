<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware([
   \App\Http\Middleware\SessionMiddleware::class,
])->group(function () {
   Route::controller(AttendanceController::class)->group(function () {
      Route::get("/", "index");
      Route::post("/store_attendance", "store")->name("store_attendance");
   });


   Route::controller(SettingsController::class)->group(function () {
      Route::get("/settings", "index")->name("index.settings");
      Route::get("/active-configuration", "activeConfiguration")->name("active-configuration");
   });
});
