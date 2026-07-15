<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'attendance_key',
        'is_active',
        'is_open',
        'closed_at',
        'open_date',
        'closing_date',
        'no_location'
    ];

    public function logs()
    {
        return $this->hasMany(Attendance_Information::class, "attendances_id", "id");
    }

    public function mapLocations()
    {
        return $this->belongsToMany(MapLocation::class, 'attendance_map_locations', 'attendance_id', 'map_location_id');
    }
}
