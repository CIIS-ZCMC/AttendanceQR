<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DailyTimeRecordLogs extends Model
{
    use SoftDeletes;
    protected $table = 'daily_time_record_logs';
    protected $fillable = [
        'user_id',
        'dtr_date',
        'log',
        'log_type',
        'device_log',
    ];
}
