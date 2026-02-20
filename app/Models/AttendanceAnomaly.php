<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceAnomaly extends Model
{
    protected $table = "attendance_anomalies";

    protected $fillable = [
        "name",
        "employee_id",
        "date_time",
        "attendance_id"
    ];
}
