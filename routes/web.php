<?php

use App\Http\Controllers\AttendanceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware([
   \App\Http\Middleware\SessionMiddleware::class,
])->group(function () {
   Route::controller(AttendanceController::class)->group(function () {
      Route::get("/", "index");
      Route::post("/store_attendance", "store")->name("store_attendance");
   });
});
