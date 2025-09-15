<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DailyTimeRecord extends Model
{
    use SoftDeletes;
    protected $table = 'daily_time_records';
    protected $fillable = [
        'user_id',
        'dtr_date',
        'time_in_am',
        'time_out_am',
        'time_in_pm',
        'time_out_pm',
        'status',
        'remarks',
        'is_time_adjustment',
        'is_generated',
    ];
}
