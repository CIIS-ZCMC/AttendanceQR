<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceScheduleController;
use App\Http\Controllers\MapLocationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('saveAttendance/{employee_id}', [AttendanceController::class, 'scannedSave']);


Route::post('save-map-coordinates', [AttendanceController::class, 'saveMapCoordinates']);

// Map Locations CRUD routes
Route::get('/map-locations', [MapLocationController::class, 'index']);
Route::post('/map-locations', [MapLocationController::class, 'store']);
Route::put('/map-locations/{id}', [MapLocationController::class, 'update']);
Route::delete('/map-locations/{id}', [MapLocationController::class, 'destroy']);

// Attendance Schedules CRUD routes
Route::get('/schedules', [AttendanceScheduleController::class, 'index']);
Route::post('/schedules', [AttendanceScheduleController::class, 'store']);
Route::put('/schedules/{id}', [AttendanceScheduleController::class, 'update']);
Route::delete('/schedules/{id}', [AttendanceScheduleController::class, 'destroy']);
