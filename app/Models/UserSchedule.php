<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class UserSchedule extends Model
{
    use SoftDeletes;
    protected $table = 'user_schedules';
    protected $fillable = [
        'user_id',
        'schedule_list_id',
        'is_active',
    ];

    public function scheduleList()
    {
        return $this->belongsTo(ScheduleList::class);
    }
}
