<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class MapLocation extends Model
{

    protected $table = "maplocation";

    protected $fillable = [
        'location',
        'description',
        'lat',
        'lng',
        'token',
        'is_default',
        'w_map',
        'open_time',
        'closing_time',
        'schedule_id'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($mapLocation) {
            if (empty($mapLocation->token)) {
                $mapLocation->token = Str::uuid()->toString();
            }
        });

        static::updating(function ($mapLocation) {
            if (empty($mapLocation->token)) {
                $mapLocation->token = $mapLocation->getOriginal('token');
            }
        });
    }

    public function scopeActive($query)
    {
        return $query->whereNotNull('open_time')
            ->whereNotNull('closing_time')
            ->where('open_time', '<=', now()->format('H:i:s'))
            ->where('closing_time', '>', now()->format('H:i:s'));
    }

    public function attendances()
    {
        return $this->belongsToMany(Attendance::class, 'attendance_map_locations', 'map_location_id', 'attendance_id');
    }

    public function schedule()
    {
        return $this->belongsTo(AttendanceSchedule::class, 'schedule_id');
    }

    public function getEffectiveOpenTimeAttribute()
    {
        if ($this->schedule_id && $this->schedule) {
            return $this->schedule->open_time;
        }
        return $this->open_time;
    }

    public function getEffectiveClosingTimeAttribute()
    {
        if ($this->schedule_id && $this->schedule) {
            return $this->schedule->closing_time;
        }
        return $this->closing_time;
    }
}
