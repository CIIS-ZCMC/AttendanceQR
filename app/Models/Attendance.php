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
        'closed_at'
    ];

    public function logs()
    {
        return $this->hasMany(Attendance_Information::class, "attendances_id", "id");
    }
}
