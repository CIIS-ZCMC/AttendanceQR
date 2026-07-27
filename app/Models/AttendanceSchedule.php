<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceSchedule extends Model
{
    use HasFactory;

    protected $table = 'attendanceschedule';

    protected $fillable = [
        'name',
        'open_time',
        'closing_time',
    ];

    public function mapLocations()
    {
        return $this->hasMany(MapLocation::class, 'schedule_id');
    }
}
