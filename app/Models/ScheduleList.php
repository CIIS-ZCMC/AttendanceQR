<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class ScheduleList extends Model
{
    use SoftDeletes;
    protected $table = 'schedule_lists';
    protected $fillable = [
        'description',
        'time_in_am',
        'time_out_am',
        'time_in_pm',
        'time_out_pm',
        'is_active',
    ];
}
